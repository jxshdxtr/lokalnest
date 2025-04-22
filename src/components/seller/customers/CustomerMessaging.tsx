import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Customer } from './types';

interface CustomerMessagingProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  message_content: string;
  created_at: string;
  read: boolean;
  sender_id: string;
  recipient_id: string;
}

interface TypingIndicator {
  userId: string;
  name: string;
  isTyping: boolean;
}

const CustomerMessaging: React.FC<CustomerMessagingProps> = ({ customer, isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isCustomerTyping, setIsCustomerTyping] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const subscriptionRef = useRef<any>(null);
  const presenceChannelRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [currentSellerId, setCurrentSellerId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Get current seller ID when component mounts
  useEffect(() => {
    // Get the current user ID when component mounts
    const getCurrentUser = async () => {
    const getCurrentSeller = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (session.session?.user) {
        setCurrentUserId(session.session.user.id);
      }
    };
    
    getCurrentUser();
  }, []);

  // Fetch messages when dialog opens
  useEffect(() => {
    if (isOpen && customer) {
      fetchMessages();
      setupMessagesSubscription();
      setupPresenceChannel();
    }

    return () => {
      // Cleanup subscriptions when component unmounts or dialog closes
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      if (presenceChannelRef.current) {
        presenceChannelRef.current.unsubscribe();
      }
    };
      markMessagesAsRead();
    }
  }, [isOpen, customer]);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mark messages as read when they are viewed
    if (isOpen && customer && messages.length > 0) {
      markMessagesAsRead();
    }
  }, [isOpen, customer, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const setupMessagesSubscription = async () => {
    if (!customer) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      // Find the actual user_id linked to this customer
      let customerId;
      
      // Check if customer has user_id directly
      if ('user_id' in customer) {
        customerId = (customer as any).user_id;
      }
      
      // If not, try to find by email in profiles table
      if (!customerId && customer.email) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', customer.email)
          .single();
          
        if (!profileError && profileData) {
          customerId = profileData.id;
        }
      }
      
      if (!customerId) {
        console.error("Cannot find this customer in the users table.");
        return;
      }

      // Create a channel for real-time updates
      const channel = supabase
        .channel('seller-messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `sender_id=eq.${customerId}`,
          },
          (payload) => {
            // Only add messages that aren't already in our state
            const newMessage = payload.new as Message;
            // Check if the message already exists in our state
            const messageExists = messages.some((msg) => msg.id === newMessage.id);
            if (!messageExists) {
              setMessages((prevMessages) => [...prevMessages, newMessage]);
            }
          }
        )
        .subscribe();

      subscriptionRef.current = channel;
    } catch (error) {
      console.error('Error setting up message subscription:', error);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      // Find unread messages from the customer
      const unreadMessageIds = messages
        .filter(msg => !msg.read && msg.sender_id === customer?.id)
        .map(msg => msg.id);

      if (unreadMessageIds.length === 0) return;

      // Update messages in Supabase
      await supabase
        .from('messages')
        .update({ read: true })
        .in('id', unreadMessageIds);

      // Update local state
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          unreadMessageIds.includes(msg.id) ? { ...msg, read: true } : msg
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Set up real-time subscription to new messages
  useEffect(() => {
    if (!customer || !isOpen) return;
    
    const channel = supabase
      .channel(`messages-${customer.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'customer_messages',
          filter: `customer_id=eq.${customer.id}`,
        },
        (payload) => {
          // Add the new message to the messages state
          const newMessage = payload.new as Message;
          setMessages(prevMessages => [...prevMessages, newMessage]);
          
          // Mark the message as read if it's from the customer
          if (newMessage.seller_id !== currentSellerId) {
            markMessageAsRead(newMessage.id);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [customer, isOpen, currentSellerId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchMessages = async () => {
    if (!customer) return;
    
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error('You must be logged in to view messages');
        return;
      }
      
      const sellerId = session.session.user.id;
      
      // Find the actual user_id linked to this customer
      let customerId;
      
      // Check if customer has user_id directly
      if ('user_id' in customer) {
        customerId = (customer as any).user_id;
      }
      
      // If not, try to find by email in profiles table
      if (!customerId && customer.email) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', customer.email)
          .single();
          
        if (!profileError && profileData) {
          customerId = profileData.id;
        }
      }
      
      if (!customerId) {
        toast.error("Cannot find this customer in the users table.");
        setLoading(false);
        return;
      }
      
      // Query messages where either seller is the sender and customer is recipient
      // OR customer is sender and seller is recipient
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${sellerId},recipient_id.eq.${customerId}),and(sender_id.eq.${customerId},recipient_id.eq.${sellerId})`)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Fetch error details:', error);
        throw error;
      }
      
      if (data) {
        setMessages(data as Message[]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!customer) return;
    
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;
      
      // Mark all messages from this customer as read
      const { error } = await supabase
        .from('customer_messages')
        .update({ is_read: true })
        .match({ 
          customer_id: customer.id,
          seller_id: session.session.user.id,
          is_read: false
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('customer_messages')
        .update({ is_read: true })
        .eq('id', messageId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !customer) return;
    
    // Debug - log the customer object
    console.log('Customer object:', customer);
    
    setSending(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error('You must be logged in to send messages');
        return;
      }
      
      // Get current user ID (seller)
      const sellerId = session.session.user.id;
      
      // Find the actual user_id linked to this customer
      // Look for user ID in customer object first
      let customerId;
      
      // Check if customer has user_id directly
      if ('user_id' in customer) {
        customerId = (customer as any).user_id;
      }
      
      // If not, try to find by email in profiles table
      if (!customerId && customer.email) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', customer.email)
          .single();
          
        if (!profileError && profileData) {
          customerId = profileData.id;
        }
      }
      
      // If still not found, try looking in auth.users (if you have permission)
      if (!customerId && customer.email) {
        try {
          const { data, error } = await (supabase.rpc as any)('get_user_id_by_email', { 
            user_email: customer.email 
          });
          
          if (!error && data) {
            customerId = data;
          }
        } catch (error) {
          console.error("Cannot retrieve user ID from email", error);
        }
      }
      
      if (!customerId) {
        toast.error("Cannot identify this customer in the users table.");
        setSending(false);
        return;
      }
      
      // For debugging - log the IDs we're using
      console.log('Sending message with:', { sellerId, customerId });
      
      const newMessage = {
        sender_id: sellerId,
        recipient_id: customerId,
        message_content: message.trim(),
        read: false
      };
      
      const { data, error } = await supabase
        .from('messages')
        .insert(newMessage)
        .select();
      
      if (error) {
        console.error('Error detail:', error);
        throw error;
      }
      
      if (data) {
        setMessages([...messages, data[0] as Message]);
        setMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatMessageTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'some time ago';
    }
  };

  const setupPresenceChannel = async () => {
    if (!customer) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const sellerId = session.session.user.id;
      const channelName = `chat:${customer.id}:${sellerId}`;

      const channel = supabase.channel(channelName, {
        config: {
          presence: {
            key: sellerId,
          },
        },
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          // Handle presence sync (users joining/leaving)
          const state = channel.presenceState();
          const customerPresence = state[customer.id];
          
          if (customerPresence) {
            const customerTypingState = customerPresence[0] as unknown as TypingIndicator;
            setIsCustomerTyping(customerTypingState.isTyping);
          } else {
            setIsCustomerTyping(false);
          }
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          // Handle join events
          if (key === customer.id) {
            const customerTypingState = newPresences[0] as unknown as TypingIndicator;
            setIsCustomerTyping(customerTypingState.isTyping);
          }
        })
        .on('presence', { event: 'leave' }, ({ key }) => {
          // Handle leave events
          if (key === customer.id) {
            setIsCustomerTyping(false);
          }
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // Track the seller's presence
            await channel.track({
              userId: sellerId,
              name: 'Seller',
              isTyping: false
            });
          }
        });

      presenceChannelRef.current = channel;
    } catch (error) {
      console.error('Error setting up presence channel:', error);
    }
  };

  const handleTypingStatus = async (isTyping: boolean) => {
    if (!presenceChannelRef.current) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      await presenceChannelRef.current.track({
        userId: session.session.user.id,
        name: 'Seller',
        isTyping
      });

      // Auto-clear typing status after 3 seconds
      if (isTyping && typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (isTyping) {
        typingTimeoutRef.current = setTimeout(async () => {
          await presenceChannelRef.current.track({
            userId: session.session.user.id,
            name: 'Seller',
            isTyping: false
          });
        }, 3000);
      }
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);
    
    // Update typing status
    if (newValue.trim().length > 0) {
      handleTypingStatus(true);
    } else {
      handleTypingStatus(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            {customer && (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={customer.avatar_url} />
                  <AvatarFallback>{getInitials(customer.full_name)}</AvatarFallback>
                </Avatar>
                <span>{customer.full_name}</span>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-4 py-6 border rounded-md my-4 overflow-y-auto">
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 border rounded-md my-4">
          {loading ? (
            <div className="flex justify-center items-center h-[300px]">
              <p className="text-sm text-muted-foreground">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center items-center h-[300px]">
              <p className="text-sm text-muted-foreground">No messages yet. Send a message to start the conversation.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {messages.map((msg) => {
                // Determine if this message was sent by me (the seller)
                const isSentByMe = msg.sender_id === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'} items-end gap-2`}
                  >
                    {!isSentByMe && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={customer?.avatar_url} />
                        <AvatarFallback className="bg-gray-200 text-gray-700">{customer ? getInitials(customer.full_name) : 'C'}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[75%] p-4 rounded-2xl ${
                        isSentByMe
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-none shadow-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-none shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium">
                          {isSentByMe ? 'You' : customer?.full_name || 'Customer'}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.message_content}</p>
                      <p className="text-xs mt-1 opacity-70">{formatMessageTime(msg.created_at)}</p>
                    </div>
                    {isSentByMe && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-purple-500 text-white">You</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })}
              {isCustomerTyping && (
                <div className="flex justify-start items-end gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={customer?.avatar_url} />
                    <AvatarFallback className="bg-gray-200 text-gray-700">{customer ? getInitials(customer.full_name) : 'C'}</AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-none">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-100"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
        
        <div className="flex gap-2 mt-2 items-center">
          <div className="flex space-x-2 text-gray-500">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </button>
          </div>
          <Textarea
            value={message}
            onChange={handleMessageChange}
            placeholder="Type your message..."
            className="resize-none rounded-full py-3 px-4 focus-visible:ring-purple-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button 
            onClick={sendMessage} 
            size="icon" 
            disabled={sending || !message.trim()}
            className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerMessaging;