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

interface Seller {
  id: string;
  name: string;
  avatar_url?: string;
}

interface BuyerMessagingProps {
  seller: Seller | null;
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

const BuyerMessaging: React.FC<BuyerMessagingProps> = ({ seller, isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isSellerTyping, setIsSellerTyping] = useState(false);
  const subscriptionRef = useRef<any>(null);
  const presenceChannelRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Get the current user ID when component mounts
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (session.session?.user) {
        setCurrentUserId(session.session.user.id);
      }
    };
    
    getCurrentUser();
  }, []);

  // Fetch messages when dialog opens
  useEffect(() => {
    if (isOpen && seller && currentUserId) {
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
  }, [isOpen, seller, currentUserId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const setupMessagesSubscription = async () => {
    if (!seller || !currentUserId) return;

    try {
      // Use seller ID directly, assuming it's already a valid reference
      const sellerId = seller.id;

      // Create a channel for real-time updates
      const channel = supabase
        .channel('buyer-messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `recipient_id=eq.${currentUserId}`,
          },
          (payload) => {
            // Only add messages that aren't already in our state
            const newMessage = payload.new as Message;
            // Verify the message is from the selected seller
            if (newMessage.sender_id === sellerId) {
              // Check if the message already exists in our state
              const messageExists = messages.some((msg) => msg.id === newMessage.id);
              if (!messageExists) {
                setMessages((prevMessages) => [...prevMessages, newMessage]);
                
                // Mark message as read since we're currently viewing it
                markMessageAsRead(newMessage.id);
              }
            }
          }
        )
        .subscribe();

      subscriptionRef.current = channel;
    } catch (error) {
      console.error('Error setting up message subscription:', error);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };
      markMessagesAsRead();
    }
  }, [isOpen, seller]);

  // Set up real-time subscription to new messages
  useEffect(() => {
    if (!seller || !isOpen || !currentUserId) return;
    
    const channel = supabase
      .channel(`buyer-messages-${seller.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'customer_messages',
          filter: `seller_id=eq.${seller.id}`,
        },
        (payload) => {
          // Add the new message to the messages state if it matches our conversation
          const newMessage = payload.new as Message;
          if (newMessage.customer_id === currentUserId) {
            setMessages(prevMessages => [...prevMessages, newMessage]);
            
            // Mark the message as read if it's from the seller
            if (newMessage.seller_id === seller.id) {
              markMessageAsRead(newMessage.id);
            }
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [seller, isOpen, currentUserId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchMessages = async () => {
    if (!seller) return;
    
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error('You must be logged in to view messages');
        return;
      }
      
      const userId = session.session.user.id;
      
      // Query messages where either I am the sender and seller is recipient
      // OR seller is sender and I am recipient
      // Using raw query to fetch customer messages
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},recipient_id.eq.${seller.id}),and(sender_id.eq.${seller.id},recipient_id.eq.${userId})`)
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
    if (!seller) return;
    
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;
      
      // Mark all messages from this seller to this customer as read
      const { error } = await supabase
        .from('customer_messages')
        .update({ is_read: true })
        .match({ 
          seller_id: seller.id,
          customer_id: session.session.user.id,
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
    if (!message.trim() || !seller) return;
    
    setSending(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error('You must be logged in to send messages');
        return;
      }
      
      const userId = session.session.user.id;
      
      // Check if this user exists in the profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.error('Profile check error:', profileError);
        toast.error('Your profile is not properly set up. Please contact support.');
        return;
      }
      
      // Use the seller ID directly - assuming it's already a valid reference
      const sellerId = seller.id;
      
      const newMessage = {
        sender_id: userId,
        recipient_id: sellerId,
        message_content: message.trim(),
        read: false
      };
      
      console.log('Sending message with:', newMessage);
      
      // Insert the new message
      const { data, error } = await supabase
        .from('messages')
        .insert(newMessage)
        .select();
      
      if (error) {
        console.error('Send error details:', error);
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
    if (!seller || !currentUserId) return;

    try {
      const channelName = `chat:${currentUserId}:${seller.id}`;

      const channel = supabase.channel(channelName, {
        config: {
          presence: {
            key: currentUserId,
          },
        },
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          // Handle presence sync (users joining/leaving)
          const state = channel.presenceState();
          const sellerPresence = state[seller.id];
          
          if (sellerPresence) {
            const sellerTypingState = sellerPresence[0] as unknown as TypingIndicator;
            setIsSellerTyping(sellerTypingState.isTyping);
          } else {
            setIsSellerTyping(false);
          }
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          // Handle join events
          if (key === seller.id) {
            const sellerTypingState = newPresences[0] as unknown as TypingIndicator;
            setIsSellerTyping(sellerTypingState.isTyping);
          }
        })
        .on('presence', { event: 'leave' }, ({ key }) => {
          // Handle leave events
          if (key === seller.id) {
            setIsSellerTyping(false);
          }
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // Track the customer's presence
            await channel.track({
              userId: currentUserId,
              name: 'Customer',
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
      await presenceChannelRef.current.track({
        userId: currentUserId,
        name: 'Customer',
        isTyping
      });

      // Auto-clear typing status after 3 seconds
      if (isTyping && typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (isTyping) {
        typingTimeoutRef.current = setTimeout(async () => {
          await presenceChannelRef.current.track({
            userId: currentUserId,
            name: 'Customer',
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
            {seller && (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={seller.avatar_url} />
                  <AvatarFallback>{getInitials(seller.name)}</AvatarFallback>
                </Avatar>
                <span>{seller.name}</span>
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
                // Determine if this message was sent by me (the current user)
                const isSentByMe = msg.sender_id === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'} items-end gap-2`}
                  >
                    {!isSentByMe && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={seller?.avatar_url} />
                        <AvatarFallback className="bg-gray-200 text-gray-700">{seller ? getInitials(seller.name) : 'S'}</AvatarFallback>
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
                          {isSentByMe ? 'You' : seller?.name || 'Seller'}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.message_content}</p>
                      <p className="text-xs mt-1 opacity-70">{formatMessageTime(msg.created_at)}</p>
                      
                      {/* Support for interactive buttons within messages */}
                      {msg.message_content.includes('Add to Cart') && !isSentByMe && (
                        <Button 
                          variant="secondary" 
                          className="mt-3 w-full bg-white hover:bg-gray-50 text-purple-600 font-medium py-1 h-8"
                          onClick={() => toast.success('Item added to cart!')}
                        >
                          Add to Cart
                        </Button>
                      )}
                      
                      {msg.message_content.includes('Done') && !isSentByMe && (
                        <Button 
                          className="mt-3 ml-auto bg-purple-600 hover:bg-purple-700 text-white font-medium py-1 h-8"
                          onClick={() => toast.success('Order completed!')}
                        >
                          Done
                        </Button>
                      )}
                    </div>
                    {isSentByMe && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-purple-500 text-white">You</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })}
              {isSellerTyping && (
                <div className="flex justify-start items-end gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={seller?.avatar_url} />
                    <AvatarFallback className="bg-gray-200 text-gray-700">{seller ? getInitials(seller.name) : 'S'}</AvatarFallback>
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

export default BuyerMessaging;
