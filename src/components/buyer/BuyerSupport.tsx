
import React, { useState } from 'react';
import { 
  MessageSquare, 
  Mail, 
  Phone,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

interface FAQ {
  question: string;
  answer: string;
  isOpen?: boolean;
}

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  date: string;
  status: 'open' | 'closed';
  replies: {
    sender: 'user' | 'support';
    message: string;
    date: string;
  }[];
}

const BuyerSupport = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      question: "How can I track my order?",
      answer: "You can track your order in the 'Orders' section of your buyer dashboard. Each order has its own tracking information and estimated delivery date.",
      isOpen: false
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept credit/debit cards through Stripe and Cash on Delivery (COD). You can manage your payment methods in the 'Payments' section of your dashboard.",
      isOpen: false
    },
    {
      question: "Can I cancel or modify my order?",
      answer: "Orders can be cancelled within 1 hour of placing them. After that, please contact customer support for assistance with any order modifications.",
      isOpen: false
    },
    {
      question: "How do I return a product?",
      answer: "If you're not satisfied with your purchase, you can initiate a return from the 'Orders' section within 7 days of delivery. Please note that some handmade items may have specific return policies.",
      isOpen: false
    },
    {
      question: "Do you ship internationally?",
      answer: "Currently, we only ship within the Philippines. We're working on expanding our shipping options to other countries in the future.",
      isOpen: false
    }
  ]);
  
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: "TKT-2923",
      subject: "Issue with recent order delivery",
      message: "My order (ORD-8294) was marked as delivered but I haven't received it yet. Can you please check on this?",
      date: "2023-10-26",
      status: 'open',
      replies: [
        {
          sender: 'support',
          message: "Hi there! I'm checking with the courier service about your delivery. Could you please confirm your complete delivery address?",
          date: "2023-10-26 14:32"
        },
        {
          sender: 'user',
          message: "Thanks for the quick response. My address is 123 Sampaguita St, Barangay San Antonio, Quezon City.",
          date: "2023-10-26 15:10"
        },
        {
          sender: 'support',
          message: "Thank you for providing your address. I've contacted the courier and they mentioned there was an issue locating your building. They will attempt delivery again tomorrow between 9 AM and 12 PM. Please ensure someone is available to receive the package.",
          date: "2023-10-26 16:45"
        }
      ]
    }
  ]);
  
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState("");
  
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    type: ""
  });

  const toggleFAQ = (index: number) => {
    setFaqs(faqs.map((faq, i) => 
      i === index ? { ...faq, isOpen: !faq.isOpen } : faq
    ));
  };

  const handleSubmitContactForm = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message || !contactForm.type) {
      toast.error("Please fill in all fields");
      return;
    }
    
    // Submit form logic would go here
    toast.success("Your message has been sent! We'll respond shortly.");
    
    // Reset form
    setContactForm({
      name: "",
      email: "",
      subject: "",
      message: "",
      type: ""
    });
  };

  const handleSendMessage = () => {
    if (!activeTicket || !newMessage.trim()) return;
    
    const updatedTicket = {
      ...activeTicket,
      replies: [
        ...activeTicket.replies,
        {
          sender: 'user' as const,
          message: newMessage,
          date: new Date().toLocaleString()
        }
      ]
    };
    
    setTickets(tickets.map(ticket => 
      ticket.id === activeTicket.id ? updatedTicket : ticket
    ));
    
    setActiveTicket(updatedTicket);
    setNewMessage("");
    
    // Simulate support response
    setTimeout(() => {
      const autoResponse = {
        ...updatedTicket,
        replies: [
          ...updatedTicket.replies,
          {
            sender: 'support' as const,
            message: "Thank you for your response. Our support team will review your message and get back to you shortly.",
            date: new Date().toLocaleString()
          }
        ]
      };
      
      setTickets(tickets.map(ticket => 
        ticket.id === activeTicket.id ? autoResponse : ticket
      ));
      
      if (activeTicket.id === updatedTicket.id) {
        setActiveTicket(autoResponse);
      }
      
      toast.success("New response from support");
    }, 10000);
  };

  const createNewTicket = () => {
    const newTicket: SupportTicket = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: contactForm.subject,
      message: contactForm.message,
      date: new Date().toISOString().split('T')[0],
      status: 'open',
      replies: []
    };
    
    setTickets([...tickets, newTicket]);
    setActiveTicket(newTicket);
    
    toast.success("Support ticket created successfully");
    
    // Reset contact form
    setContactForm({
      name: "",
      email: "",
      subject: "",
      message: "",
      type: ""
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Customer Support</h2>
        <p className="text-muted-foreground">Get help with your orders and questions</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>View and manage your support requests</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {tickets.length > 0 ? (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div 
                      key={ticket.id} 
                      className={`p-4 border rounded-md cursor-pointer transition-colors ${
                        activeTicket?.id === ticket.id ? 'bg-muted border-primary' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setActiveTicket(ticket)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{ticket.subject}</h3>
                          <p className="text-sm text-muted-foreground mt-1">Ticket #{ticket.id} • {new Date(ticket.date).toLocaleDateString()}</p>
                        </div>
                        <div className={`px-2 py-1 text-xs rounded-full font-medium ${
                          ticket.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {ticket.status === 'open' ? 'Open' : 'Closed'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No support tickets yet</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {activeTicket && (
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle>{activeTicket.subject}</CardTitle>
                <CardDescription>Ticket #{activeTicket.id} • {new Date(activeTicket.date).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-md">
                    <p className="text-sm">{activeTicket.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">You • {new Date(activeTicket.date).toLocaleDateString()}</p>
                  </div>
                  
                  {activeTicket.replies.map((reply, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-md ${
                        reply.sender === 'user' 
                          ? 'bg-muted ml-8' 
                          : 'bg-primary/10 mr-8'
                      }`}
                    >
                      <p className="text-sm">{reply.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {reply.sender === 'user' ? 'You' : 'Support Agent'} • {reply.date}
                      </p>
                    </div>
                  ))}
                  
                  <div className="flex items-center space-x-2 pt-4">
                    <Input 
                      placeholder="Type your message..." 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>Send us a message and we'll get back to you</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmitContactForm} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Name</label>
                  <Input 
                    id="name" 
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    placeholder="Your name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input 
                    id="email" 
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    placeholder="Your email address"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="type" className="text-sm font-medium">Issue Type</label>
                  <Select 
                    value={contactForm.type}
                    onValueChange={(value) => setContactForm({...contactForm, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="order">Order Issue</SelectItem>
                      <SelectItem value="payment">Payment Problem</SelectItem>
                      <SelectItem value="product">Product Question</SelectItem>
                      <SelectItem value="delivery">Shipping/Delivery</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                  <Input 
                    id="subject" 
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    placeholder="Brief summary of your issue"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">Message</label>
                  <Textarea 
                    id="message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    placeholder="Please describe your issue in detail"
                    className="min-h-[120px]"
                  />
                </div>
                
                <div className="flex justify-between pt-2">
                  <Button variant="outline" type="reset">Cancel</Button>
                  <div className="space-x-2">
                    <Button variant="outline" type="button" onClick={createNewTicket}>
                      Create Ticket
                    </Button>
                    <Button type="submit">Send Message</Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Find quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border rounded-md">
                    <button 
                      className="flex justify-between items-center w-full p-4 text-left font-medium"
                      onClick={() => toggleFAQ(index)}
                    >
                      <span>{faq.question}</span>
                      {faq.isOpen ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    {faq.isOpen && (
                      <div className="p-4 pt-0 text-sm text-muted-foreground">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Other ways to reach our team</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-3 rounded-full mr-4">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-muted-foreground">support@pinoyartisanal.com</p>
                    <p className="text-xs text-muted-foreground">Response time: Within 24 hours</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-primary/10 p-3 rounded-full mr-4">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-muted-foreground">+63 (2) 8123-4567</p>
                    <p className="text-xs text-muted-foreground">Monday to Friday, 9am - 5pm PHT</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-primary/10 p-3 rounded-full mr-4">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Live Chat</p>
                    <p className="text-sm text-muted-foreground">Available on our website</p>
                    <p className="text-xs text-muted-foreground">Monday to Sunday, 8am - 8pm PHT</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BuyerSupport;
