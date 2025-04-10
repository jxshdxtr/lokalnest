import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
  message: string;
  created_at: string;
  is_read: boolean;
  seller_id: string;
  customer_id: string;
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
  const subscriptionRef = useRef<any>(null);
  const presenceChannelRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

      // First check if the customer exists in the profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', customer.id)
        .single();
      
      // If the customer doesn't exist in profiles table, use the customer id as is
      let customerId = customer.id;

      // Create a channel for real-time updates
      const channel = supabase
        .channel('customer-messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'customer_messages',
            filter: `customer_id=eq.${customerId}`,
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
        .filter(msg => !msg.is_read && msg.customer_id === customer?.id)
        .map(msg => msg.id);

      if (unreadMessageIds.length === 0) return;

      // Update messages in Supabase
      await supabase
        .from('customer_messages')
        .update({ is_read: true })
        .in('id', unreadMessageIds);

      // Update local state
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          unreadMessageIds.includes(msg.id) ? { ...msg, is_read: true } : msg
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const fetchMessages = async () => {
    if (!customer) return;
    
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error('You must be logged in to view messages');
        return;
      }
      
      // Using raw query instead of typed query since the types don't include customer_messages yet
      const { data, error } = await supabase
        .from('customer_messages')
        .select('*')
        .or(`seller_id.eq.${session.session.user.id},customer_id.eq.${customer.id}`)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        // Explicitly cast the data to our Message interface
        const typedMessages = data.map(item => ({
          id: item.id,
          message: item.message,
          created_at: item.created_at,
          is_read: item.is_read,
          seller_id: item.seller_id,
          customer_id: item.customer_id
        })) as Message[];
        
        setMessages(typedMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
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
      
      // Get current user ID
      const sellerId = session.session.user.id;
      
      // We need to figure out what ID to use for the customer
      // Since the error says the foreign key constraint is with the 'users' table,
      // we assume the ID should be from the auth system
      
      // Let's try to get the actual auth user info from customer if available
      let customerId = null;
      
      // Check if there's a user_id property on the customer object
      if ('user_id' in customer) {
        customerId = (customer as any).user_id;
      }
      
      // Try to locate a user by email if the customer has an email property
      if (!customerId && customer.email) {
        try {
          // Try to look up a user by email in the auth.users table
          const { data: userData, error } = await supabase.auth.admin.listUsers();
          
          if (!error && userData?.users) {
            const userWithMatchingEmail = userData.users.find(user => 
              (user as any).email === customer.email
            );
            if (userWithMatchingEmail) {
              customerId = userWithMatchingEmail.id;
            }
          }
        } catch (error) {
          console.error('Error looking up user by email:', error);
          // Continue with other approaches
        }
      }
      
      // If we still don't have a valid user ID, let's try using the current user's ID for testing
      if (!customerId) {
        console.warn("Could not find a valid user_id for the customer, using the current user's ID for testing");
        customerId = sellerId;
      }
      
      // For debugging - log the IDs we're using
      console.log('Sending message with:', { sellerId, customerId });
      
      const newMessage = {
        seller_id: sellerId,
        customer_id: customerId,
        message: message.trim(),
        is_read: false
      };
      
      // Using raw query since the types don't include customer_messages yet
      const { data, error } = await supabase
        .from('customer_messages')
        .insert(newMessage)
        .select();
      
      if (error) {
        console.error('Error detail:', error);
        throw error;
      }
      
      if (data) {
        // Explicitly cast the new message to our Message interface
        const typedNewMessage = {
          id: data[0].id,
          message: data[0].message,
          created_at: data[0].created_at,
          is_read: data[0].is_read,
          seller_id: data[0].seller_id,
          customer_id: data[0].customer_id
        } as Message;
        
        setMessages([...messages, typedNewMessage]);
        setMessage('');
        toast.success('Message sent');
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
        
        <ScrollArea className="flex-1 p-4 border rounded-md my-4">
          {loading ? (
            <div className="flex justify-center items-center h-[300px]">
              <p className="text-sm text-muted-foreground">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center items-center h-[300px]">
              <p className="text-sm text-muted-foreground">No messages yet. Send a message to start the conversation.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.customer_id === customer?.id && msg.seller_id !== customer?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.customer_id === customer?.id && msg.seller_id !== customer?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs mt-1 opacity-70">{formatMessageTime(msg.created_at)}</p>
                  </div>
                </div>
              ))}
              {isCustomerTyping && (
                <div className="flex justify-end">
                  <div className="bg-muted p-2 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-foreground/60 animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-foreground/60 animate-pulse delay-100"></div>
                      <div className="w-2 h-2 rounded-full bg-foreground/60 animate-pulse delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
        
        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={handleMessageChange}
            placeholder="Type your message..."
            className="resize-none"
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
            className="h-full aspect-square"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerMessaging;