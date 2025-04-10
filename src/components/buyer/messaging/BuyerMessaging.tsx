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

  useEffect(() => {
    // Get the current user ID when component mounts
    const getCurrentUser = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (session.session?.user) {
        setCurrentUserId(session.session.user.id);
      }
    };
    
    getCurrentUser();
  }, []);

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
            table: 'customer_messages',
            filter: `customer_id=eq.${currentUserId}`,
          },
          (payload) => {
            // Only add messages that aren't already in our state
            const newMessage = payload.new as Message;
            // Verify the message is from the selected seller
            if (newMessage.seller_id === sellerId) {
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
        .from('customer_messages')
        .update({ is_read: true })
        .eq('id', messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const fetchMessages = async () => {
    if (!seller) return;
    
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error('You must be logged in to view messages');
        return;
      }
      
      // Using raw query since the types don't include customer_messages yet
      const { data, error } = await supabase
        .from('customer_messages')
        .select('*')
        .or(`seller_id.eq.${seller.id},customer_id.eq.${session.session.user.id}`)
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
    if (!message.trim() || !seller) return;
    
    setSending(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error('You must be logged in to send messages');
        return;
      }
      
      // Use the seller ID directly - assuming it's already a valid reference
      const sellerId = seller.id;
      
      const newMessage = {
        seller_id: sellerId,
        customer_id: session.session.user.id,
        message: message.trim(),
        is_read: false
      };
      
      // Using raw query since the types don't include customer_messages yet
      const { data, error } = await supabase
        .from('customer_messages')
        .insert(newMessage)
        .select();
      
      if (error) throw error;
      
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
                  className={`flex ${msg.customer_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.customer_id === currentUserId
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs mt-1 opacity-70">{formatMessageTime(msg.created_at)}</p>
                  </div>
                </div>
              ))}
              {isSellerTyping && (
                <div className="flex justify-start">
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

export default BuyerMessaging;
