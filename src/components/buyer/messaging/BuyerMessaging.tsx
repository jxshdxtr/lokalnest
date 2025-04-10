
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
  message: string;
  created_at: string;
  is_read: boolean;
  seller_id: string;
  customer_id: string;
}

const BuyerMessaging: React.FC<BuyerMessagingProps> = ({ seller, isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
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
    if (isOpen && seller) {
      fetchMessages();
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
      
      // Using raw query to fetch customer messages
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
      
      const newMessage = {
        seller_id: seller.id,
        customer_id: session.session.user.id,
        message: message.trim(),
        is_read: false
      };
      
      // Insert the new message
      const { data, error } = await supabase
        .from('customer_messages')
        .insert(newMessage)
        .select();
      
      if (error) throw error;
      
      if (data) {
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
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
        
        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
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
