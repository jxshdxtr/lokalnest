
import React, { useState } from 'react';
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

interface Review {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  rating: number;
  content: string;
  date: string;
}

const BuyerReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: "rev_1",
      productId: "prod_1",
      productName: "Handwoven Cotton Tote Bag",
      productImage: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=2670&q=80",
      rating: 5,
      content: "The quality of this bag exceeded my expectations! The weaving is intricate and the material is durable. Love that it's eco-friendly too.",
      date: "2023-10-20"
    },
    {
      id: "rev_2",
      productId: "prod_2",
      productName: "Handcrafted Wooden Bowls",
      productImage: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=2670&q=80",
      rating: 4,
      content: "Beautiful craftsmanship and natural wood grain. They're a bit smaller than I expected but still very useful for serving snacks.",
      date: "2023-10-10"
    }
  ]);
  
  const [productsToReview, setProductsToReview] = useState([
    {
      id: "prod_3",
      name: "Hand-painted Ceramic Mug",
      image: "https://images.unsplash.com/photo-1547619292-8816ee7cdd50?auto=format&fit=crop&w=2670&q=80",
    },
    {
      id: "prod_4",
      name: "Bamboo Serving Tray",
      image: "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?auto=format&fit=crop&w=2670&q=80",
    }
  ]);
  
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

  const handleRatingChange = (rating: number, isEditing = false) => {
    if (isEditing && editReview) {
      setEditReview({ ...editReview, rating });
    } else {
      setNewReview({ ...newReview, rating });
    }
  };

  const handleDeleteReview = (id: string) => {
    setReviews(reviews.filter(review => review.id !== id));
    toast.success("Review deleted successfully");
  };

  const handleEditReview = (review: Review) => {
    setEditReview(review);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editReview) return;
    
    setReviews(reviews.map(r => r.id === editReview.id ? editReview : r));
    setIsEditDialogOpen(false);
    setEditReview(null);
    toast.success("Review updated successfully");
  };

  const handleSubmitNewReview = () => {
    if (!selectedProductId) return;
    
    const product = productsToReview.find(p => p.id === selectedProductId);
    if (!product) return;
    
    const newReviewItem: Review = {
      id: `rev_${Date.now()}`,
      productId: selectedProductId,
      productName: product.name,
      productImage: product.image,
      rating: newReview.rating,
      content: newReview.content,
      date: new Date().toISOString().split('T')[0]
    };
    
    setReviews([...reviews, newReviewItem]);
    setProductsToReview(productsToReview.filter(p => p.id !== selectedProductId));
    
    setIsNewReviewDialogOpen(false);
    setNewReview({
      productId: "",
      rating: 5,
      content: ""
    });
    setSelectedProductId(null);
    
    toast.success("Review submitted successfully");
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
          {reviews.length > 0 ? (
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
                              <AlertDialogAction onClick={() => handleDeleteReview(review.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex mb-2">
                      {renderStars(review.rating)}
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
          {productsToReview.length > 0 ? (
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
                          <p className="text-sm text-muted-foreground">Purchased recently</p>
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
                            <Button variant="outline" onClick={() => setIsNewReviewDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubmitNewReview}>Submit Review</Button>
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
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BuyerReviews;
