
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Calendar } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Form schema
const verificationSchema = z.object({
  documentType: z.string().min(1, { message: 'Document type is required' }),
  dtiCertificationNumber: z.string().min(3, { message: 'DTI Certification Number is required' }),
  dtiCertificationExpiry: z.date({
    required_error: "Expiry date is required",
  }),
  documentFile: z.instanceof(File, { message: 'Document file is required' }),
});

type VerificationFormValues = z.infer<typeof verificationSchema>;

interface SellerVerificationFormProps {
  userId: string;
  onComplete: () => void;
}

const SellerVerificationForm = ({ userId, onComplete }: SellerVerificationFormProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      documentType: 'DTI Certificate',
      dtiCertificationNumber: '',
    },
  });

  const onSubmit = async (data: VerificationFormValues) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      // Upload the file to Supabase Storage
      const fileExt = data.documentFile.name.split('.').pop();
      const fileName = `${userId}-dti-cert-${Date.now()}.${fileExt}`;
      
      // Upload to Storage
      const { error: uploadError, data: fileData } = await supabase.storage
        .from('seller_documents')
        .upload(fileName, data.documentFile);
        
      if (uploadError) throw uploadError;

      const fileUrl = fileData.path;
      
      // Save verification details to the database
      const { error: dbError } = await supabase
        .from('seller_verifications')
        .insert({
          seller_id: userId,
          document_type: data.documentType,
          document_url: fileUrl,
          dti_certification_number: data.dtiCertificationNumber,
          dti_certification_expiry: data.dtiCertificationExpiry.toISOString().split('T')[0],
          status: 'pending',
          notes: 'Awaiting verification',
        });
        
      if (dbError) throw dbError;
      
      toast.success('Verification documents submitted successfully. Your account is pending verification.');
      onComplete();
    } catch (error: any) {
      setUploadError(error.message || 'Failed to upload verification documents. Please try again.');
      toast.error(error.message || 'Failed to upload verification documents. Please try again.');
      console.error('Verification upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Seller Verification</h2>
        <p className="text-muted-foreground">
          Please upload your DTI Certificate to verify your seller account
        </p>
      </div>

      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          Error: {uploadError}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="documentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Type</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isUploading}
                    placeholder="DTI Certificate"
                    readOnly
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dtiCertificationNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>DTI Certification Number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isUploading}
                    placeholder="e.g. DTI-2025-12345"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dtiCertificationExpiry"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>DTI Certification Expiry</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isUploading}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="documentFile"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>DTI Certification Document</FormLabel>
                <FormControl>
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Input
                      id="documentFile"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      disabled={isUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onChange(file);
                        }
                      }}
                      {...fieldProps}
                    />
                  </div>
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Upload your DTI Certificate (PDF, JPG, JPEG, or PNG)
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Submit Verification'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SellerVerificationForm;
