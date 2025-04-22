import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Order } from './types';
import { OrderStatusBadge, OrderStatusIcon } from './OrderStatusBadge';
import OrderTrackingInfo from './OrderTrackingInfo';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { submitReview } from '@/services/reviewService';

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    name: string;
    image: string;
  } | null>(null);
  const [review, setReview] = useState({
    rating: 5,
    content: ""
  });

  const handleProductClick = (item, itemIndex: number) => {
    if (order.status === 'delivered') {
      // Use the proper product_id field instead of creating a composite ID
      const productId = item.product_id;
      
      if (!productId) {
        console.error("No product_id available for this item");
        toast.error("Cannot review this product: missing product ID");
        return;
      }
      
      setSelectedProduct({
        id: productId,
        name: item.name,
        image: item.image
      });
      setIsReviewDialogOpen(true);
    }
  };

  const handleRatingChange = (rating: number) => {
    setReview({ ...review, rating });
  };

  const renderStars = (rating: number, interactive = false) => {
    return Array(5).fill(0).map((_, i) => (
      <button
        key={i}
        className={`${interactive ? "cursor-pointer" : "cursor-default"}`}
        onClick={() => interactive && handleRatingChange(i + 1)}
        type={interactive ? "button" : undefined}
      >
        <Star 
          className={`h-5 w-5 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} 
        />
      </button>
    ));
  };

  const handleSubmitReview = async () => {
    if (!selectedProduct) return;
    
    try {
      setIsSubmitting(true);
      
      const result = await submitReview({
        productId: selectedProduct.id,
        rating: review.rating,
        comment: review.content
      });
      
      if (result) {
        toast.success(`Review for ${selectedProduct.name} submitted successfully`);
        
        setIsReviewDialogOpen(false);
        setSelectedProduct(null);
        setReview({
          rating: 5,
          content: ""
        });
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit your review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDelivered = order.status === 'delivered';

  return (
    <>
      <Card key={order.id} className={`overflow-hidden ${isDelivered ? 'hover:border-primary cursor-pointer transition-colors' : ''}`}>
        <CardHeader className="bg-muted/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div>
              <CardTitle>Order #{order.id}</CardTitle>
              <CardDescription>Placed on {new Date(order.date).toLocaleDateString()}</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <OrderStatusIcon status={order.status} />
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center space-x-4 ${isDelivered ? 'hover:bg-muted/50 rounded-md p-2 -m-2 cursor-pointer transition-colors' : ''}`}
                  onClick={() => isDelivered && handleProductClick(item, idx)}
                >
                  <div className="h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x ₱{item.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₱{(item.quantity * item.price).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between pt-4 border-t border-border">
              <p className="font-semibold">Total</p>
              <p className="font-semibold">₱{order.total.toLocaleString()}</p>
            </div>

            {order.tracking && (
              <OrderTrackingInfo order={order} tracking={order.tracking} />
            )}

            {isDelivered && (
              <div className="text-center pt-4 text-sm text-muted-foreground">
                Click on any product to leave a review
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Product</DialogTitle>
            <DialogDescription>
              Share your thoughts about {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="py-4 space-y-4">
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-16 w-16 rounded-md overflow-hidden bg-muted">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name}
                    className="h-full w-full object-cover" 
                  />
                </div>
                <h3 className="font-medium">{selectedProduct.name}</h3>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Rating</p>
                <div className="flex">
                  {renderStars(review.rating, true)}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Your Review</p>
                <Textarea 
                  placeholder="Write your review here..." 
                  value={review.content}
                  onChange={(e) => setReview({...review, content: e.target.value})}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReview} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrderCard;
