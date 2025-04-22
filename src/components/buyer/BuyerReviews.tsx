import React, { useState, useEffect } from 'react';
import { Star, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { getUserReviews, submitReview, deleteReview, updateReview } from '@/services/reviewService';
import { getReviewableProducts } from '@/services/orderService';

interface Review {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  rating: number;
  content: string;
  date: string;
  isVerified?: boolean;
}

interface ProductToReview {
  id: string;
  name: string;
  image: string;
  orderId: string;
  orderDate: string;
}

const BuyerReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  
  const [productsToReview, setProductsToReview] = useState<ProductToReview[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  
  const [editReview, setEditReview] = useState<Review | null>(null);
  const [newReview, setNewReview] = useState({
    productId: "",
    rating: 5,
    content: ""
  });
  
  // For new review
  const [isNewReviewDialogOpen, setIsNewReviewDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  
  // For edit review
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchProductsToReview();
  }, []);

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const fetchedReviews = await getUserReviews();
      setReviews(fetchedReviews);
      console.log("Fetched reviews:", fetchedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load your reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchProductsToReview = async () => {
    setProductsLoading(true);
    try {
      const products = await getReviewableProducts();
      setProductsToReview(products);
      console.log("Products to review:", products);
    } catch (error) {
      console.error('Error fetching products to review:', error);
      toast.error('Failed to load products to review');
    } finally {
      setProductsLoading(false);
    }
  };

  const handleRatingChange = (rating: number, isEditing = false) => {
    if (isEditing && editReview) {
      setEditReview({ ...editReview, rating });
    } else {
      setNewReview({ ...newReview, rating });
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      setIsSubmitting(true);
      const success = await deleteReview(id);
      
      if (success) {
        setReviews(reviews.filter(review => review.id !== id));
        toast.success("Review deleted successfully");
        
        // Refresh products to review since this might now be available to review again
        fetchProductsToReview();
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditReview = (review: Review) => {
    setEditReview(review);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editReview) return;
    
    try {
      setIsSubmitting(true);
      const success = await updateReview(editReview.id, {
        rating: editReview.rating,
        comment: editReview.content
      });
      
      if (success) {
        setReviews(reviews.map(r => r.id === editReview.id ? editReview : r));
        setIsEditDialogOpen(false);
        setEditReview(null);
        toast.success("Review updated successfully");
      }
    } catch (error) {
      console.error('Error updating review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitNewReview = async () => {
    if (!selectedProductId) return;
    
    const product = productsToReview.find(p => p.id === selectedProductId);
    if (!product) return;
    
    try {
      setIsSubmitting(true);
      
      // Submit the review to the database
      const result = await submitReview({
        productId: selectedProductId,
        rating: newReview.rating,
        comment: newReview.content
      });
      
      if (result) {
        // Create a new review object for the UI
        const newReviewItem: Review = {
          id: result.id,
          productId: selectedProductId,
          productName: product.name,
          productImage: product.image,
          rating: newReview.rating,
          content: newReview.content,
          date: new Date().toISOString(),
          isVerified: true
        };
        
        setReviews([newReviewItem, ...reviews]);
        
        // Remove the product from the products to review list
        setProductsToReview(productsToReview.filter(p => p.id !== selectedProductId));
        
        setIsNewReviewDialogOpen(false);
        setNewReview({
          productId: "",
          rating: 5,
          content: ""
        });
        setSelectedProductId(null);
        
        toast.success("Review submitted successfully");
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit your review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, isEditing = false) => {
    return Array(5).fill(0).map((_, i) => (
      <button
        key={i}
        className={`${interactive ? "cursor-pointer" : "cursor-default"}`}
        onClick={() => interactive && handleRatingChange(i + 1, isEditing)}
        type={interactive ? "button" : undefined}
      >
        <Star 
          className={`h-5 w-5 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} 
        />
      </button>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-semibold">My Reviews</h2>
          <p className="text-muted-foreground">Manage your product reviews</p>
        </div>
      </div>

      <Tabs defaultValue="my-reviews" className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-reviews">My Reviews</TabsTrigger>
          <TabsTrigger value="to-review">Products to Review</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-reviews" className="space-y-4">
          {reviewsLoading ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Loading your reviews...</p>
            </div>
          ) : reviews.length > 0 ? (
            <div className="grid gap-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-md overflow-hidden bg-muted mr-4">
                          <img 
                            src={review.productImage} 
                            alt={review.productName}
                            className="h-full w-full object-cover" 
                          />
                        </div>
                        <div>
                          <CardTitle className="text-base">{review.productName}</CardTitle>
                          <CardDescription>{new Date(review.date).toLocaleDateString()}</CardDescription>
                        </div>
                      </div>
                      <div className="flex">
                        <Button variant="ghost" size="icon" onClick={() => handleEditReview(review)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Review</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this review? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteReview(review.id)}
                                disabled={isSubmitting}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex mb-2">
                      {renderStars(review.rating)}
                      {review.isVerified && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <p className="text-sm">{review.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border rounded-md">
              <p className="text-muted-foreground">You haven't written any reviews yet.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="to-review" className="space-y-4">
          {productsLoading ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Loading products to review...</p>
            </div>
          ) : productsToReview.length > 0 ? (
            <div className="grid gap-4">
              {productsToReview.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-16 w-16 rounded-md overflow-hidden bg-muted mr-4">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="h-full w-full object-cover" 
                          />
                        </div>
                        <div>
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Ordered on {new Date(product.orderDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Dialog open={isNewReviewDialogOpen && selectedProductId === product.id} onOpenChange={(open) => {
                        setIsNewReviewDialogOpen(open);
                        if (!open) setSelectedProductId(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button onClick={() => setSelectedProductId(product.id)}>
                            Write Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Review {product.name}</DialogTitle>
                            <DialogDescription>
                              Share your thoughts about this product
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4 space-y-4">
                            <div>
                              <p className="text-sm font-medium mb-2">Rating</p>
                              <div className="flex">
                                {renderStars(newReview.rating, true)}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-2">Your Review</p>
                              <Textarea 
                                placeholder="Write your review here..." 
                                value={newReview.content}
                                onChange={(e) => setNewReview({...newReview, content: e.target.value})}
                                className="min-h-[100px]"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              variant="outline" 
                              onClick={() => setIsNewReviewDialogOpen(false)}
                              disabled={isSubmitting}
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleSubmitNewReview}
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? "Submitting..." : "Submit Review"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border rounded-md">
              <p className="text-muted-foreground">No products to review at this time.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Edit Review Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
            <DialogDescription>
              Update your review for {editReview?.productName}
            </DialogDescription>
          </DialogHeader>
          {editReview && (
            <div className="py-4 space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Rating</p>
                <div className="flex">
                  {renderStars(editReview.rating, true, true)}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Your Review</p>
                <Textarea 
                  value={editReview.content}
                  onChange={(e) => setEditReview({...editReview, content: e.target.value})}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BuyerReviews;
