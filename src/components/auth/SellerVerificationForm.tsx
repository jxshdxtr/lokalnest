
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
  FormDescription,
} from '@/components/ui/form';
import { Calendar } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from "@/components/ui/textarea";
import { 
  Card,
  CardContent
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

// Form schema
const verificationSchema = z.object({
  // Entity information
  sellerType: z.enum(['Sole Proprietorship', 'Corporation/Partnership/Cooperative', 'One Person Corporation']),
  firstName: z.string().min(2, { message: 'First name is required' }),
  middleName: z.string().optional(),
  lastName: z.string().min(2, { message: 'Last name is required' }),
  suffix: z.string().optional(),
  businessName: z.string().min(3, { message: 'Business name is required' }),
  
  // Address information
  registeredAddress: z.string().min(5, { message: 'Registered address is required' }),
  zipCode: z.string().min(3, { message: 'Zip code is required' }),
  
  // Document information
  documentType: z.string().min(1, { message: 'Document type is required' }),
  dtiCertificationNumber: z.string().min(3, { message: 'DTI Certification Number is required' }),
  dtiCertificationExpiry: z.date({
    required_error: "Expiry date is required",
  }),
  documentFile: z.instanceof(File, { message: 'Document file is required' }),
  
  // Government ID
  governmentIdType: z.string().min(1, { message: 'Government ID type is required' }),
  governmentIdFile: z.instanceof(File, { message: 'Government ID file is required' }),
  
  // Tax information
  tinNumber: z.string().min(3, { message: 'TIN number is required' }),
  vatStatus: z.enum(['VAT Registered', 'Non-VAT Registered']).optional(),
  
  // Terms agreement
  termsAgreed: z.boolean().refine(value => value === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

type VerificationFormValues = z.infer<typeof verificationSchema>;

interface SellerVerificationFormProps {
  userId: string;
  onComplete: () => void;
}

const SellerVerificationForm = ({ userId, onComplete }: SellerVerificationFormProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      documentType: 'DTI Certificate',
      sellerType: 'Sole Proprietorship',
      vatStatus: 'Non-VAT Registered',
      termsAgreed: false,
    },
  });

  const onSubmit = async (data: VerificationFormValues) => {
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      // Create folder with user ID as the name to organize uploads
      const docFileExt = data.documentFile.name.split('.').pop();
      const documentFileName = `${userId}/document_${Date.now()}.${docFileExt}`;
      
      const govIdFileExt = data.governmentIdFile.name.split('.').pop();
      const govIdFileName = `${userId}/govid_${Date.now()}.${govIdFileExt}`;
      
      // We need to manually track upload progress since onUploadProgress isn't supported
      setUploadProgress(10); // Start progress indication
      
      // Upload DTI document to Storage
      const { error: documentUploadError } = await supabase.storage
        .from('seller_documents')
        .upload(documentFileName, data.documentFile, {
          cacheControl: '3600',
          upsert: false,
        });
        
      setUploadProgress(40); // Update progress after first upload
        
      if (documentUploadError) throw documentUploadError;
      
      // Upload Government ID to Storage
      const { error: govIdUploadError } = await supabase.storage
        .from('seller_documents')
        .upload(govIdFileName, data.governmentIdFile, {
          cacheControl: '3600',
          upsert: false,
        });
      
      setUploadProgress(70); // Update progress after second upload
      
      if (govIdUploadError) throw govIdUploadError;
      
      setUploadProgress(80); // Update progress before database operation
      
      // Save verification details to the database with all the new fields
      const { error: dbError } = await supabase
        .from('seller_verifications')
        .insert({
          seller_id: userId,
          document_type: data.documentType,
          document_url: documentFileName,
          dti_certification_number: data.dtiCertificationNumber,
          dti_certification_expiry: data.dtiCertificationExpiry.toISOString().split('T')[0],
          status: 'pending',
          notes: 'Awaiting verification',
          // New fields added to the database
          seller_type: data.sellerType,
          first_name: data.firstName,
          middle_name: data.middleName,
          last_name: data.lastName,
          suffix: data.suffix,
          business_name: data.businessName,
          registered_address: data.registeredAddress,
          zip_code: data.zipCode,
          government_id_type: data.governmentIdType,
          government_id_url: govIdFileName,
          tin_number: data.tinNumber,
          vat_status: data.vatStatus,
        });
        
      setUploadProgress(100); // Complete progress
      
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
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Seller Verification</h2>
        <p className="text-muted-foreground">
          Please complete this form to verify your seller account
        </p>
      </div>

      <Alert variant="default" className="bg-blue-50 border-blue-200 mb-4">
        <Info className="h-4 w-4" />
        <AlertDescription>
          This information will be used to ensure proper compliance to seller onboarding requirements for the marketplace.
          We will not re-use any records or documents for incomplete or incorrect information provided.
        </AlertDescription>
      </Alert>

      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          Error: {uploadError}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Entity Information Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Entity Information</h3>
              </div>
          
              <FormField
                control={form.control}
                name="sellerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seller Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isUploading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select seller type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                        <SelectItem value="Corporation/Partnership/Cooperative">Corporation/Partnership/Cooperative</SelectItem>
                        <SelectItem value="One Person Corporation">One Person Corporation</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="mt-4 mb-2">
                <h4 className="text-sm font-medium">Individual Registered Name</h4>
                <p className="text-xs text-muted-foreground mb-2">Individual Registered Name is your full legal name as written on your government-issued ID</p>
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isUploading}
                          placeholder="First name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="middleName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Middle Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isUploading}
                          placeholder="Middle name (optional)"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isUploading}
                          placeholder="Last name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="suffix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Suffix</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isUploading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select suffix (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="Jr.">Jr.</SelectItem>
                          <SelectItem value="Sr.">Sr.</SelectItem>
                          <SelectItem value="I">I</SelectItem>
                          <SelectItem value="II">II</SelectItem>
                          <SelectItem value="III">III</SelectItem>
                          <SelectItem value="IV">IV</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-6">
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name/Trade Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isUploading}
                          placeholder="Enter your business name"
                        />
                      </FormControl>
                      <FormDescription>
                        Please fill in your Business Name/Trade Name.
                        If Business Name/Trade Name is not applicable, please enter your Taxpayer Name as indicated on your BIR Certificate.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-6">
                <FormField
                  control={form.control}
                  name="registeredAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registered Address</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          disabled={isUploading}
                          placeholder="Enter your registered business address"
                          className="resize-none"
                        />
                      </FormControl>
                      <FormDescription>
                        Registered Address as written on your BIR Certificate of Registration
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-6">
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isUploading}
                          placeholder="Enter zip code"
                          maxLength={10}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* DTI Certificate Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Primary Business Document</h3>
              </div>
              
              <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isUploading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DTI Certificate">DTI Certificate</SelectItem>
                        <SelectItem value="SEC Registration">SEC Registration</SelectItem>
                        <SelectItem value="Mayor's Permit">Mayor's Permit</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
    
              <FormField
                control={form.control}
                name="dtiCertificationNumber"
                render={({ field }) => (
                  <FormItem className="mt-4">
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
                  <FormItem className="mt-4">
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
                  <FormItem className="mt-4">
                    <FormLabel>Upload Document</FormLabel>
                    <FormControl>
                      <div className="grid w-full items-center gap-1.5">
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
                    <FormDescription>
                      Supported formats: JPG, PNG, PDF (Maximum: 20MB)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Government ID Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Government ID</h3>
              </div>
              
              <FormField
                control={form.control}
                name="governmentIdType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Government ID Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isUploading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ID type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="National ID">National ID</SelectItem>
                        <SelectItem value="Driver's License">Driver's License</SelectItem>
                        <SelectItem value="Passport">Passport</SelectItem>
                        <SelectItem value="SSS ID">SSS ID</SelectItem>
                        <SelectItem value="PhilHealth ID">PhilHealth ID</SelectItem>
                        <SelectItem value="Voter's ID">Voter's ID</SelectItem>
                        <SelectItem value="Postal ID">Postal ID</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Please submit a clear photo of your government-issued ID
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="governmentIdFile"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Upload Government ID (w/ Photo)</FormLabel>
                    <FormControl>
                      <div className="grid w-full items-center gap-1.5">
                        <Input
                          id="governmentIdFile"
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
                    <FormDescription>
                      Supported formats: JPG, PNG, PDF (Maximum: 20MB)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          {/* Tax Information Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Tax Information</h3>
              </div>
              
              <FormField
                control={form.control}
                name="tinNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxpayer Identification Number (TIN)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isUploading}
                        placeholder="e.g. 123-456-789-000"
                      />
                    </FormControl>
                    <FormDescription>
                      Format: XXX-XXX-XXX-XXX. TIN can be found on your BIR Form 2303, if you don't have one, e.g. (000-000-000-000)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="vatStatus"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Value Added Tax Registration Status</FormLabel>
                    <div className="flex flex-row items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="vat-registered"
                          value="VAT Registered"
                          checked={field.value === "VAT Registered"}
                          onChange={() => field.onChange("VAT Registered")}
                          className="form-radio h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                          disabled={isUploading}
                        />
                        <label htmlFor="vat-registered" className="text-sm">VAT Registered</label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="non-vat-registered"
                          value="Non-VAT Registered"
                          checked={field.value === "Non-VAT Registered"}
                          onChange={() => field.onChange("Non-VAT Registered")}
                          className="form-radio h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                          disabled={isUploading}
                        />
                        <label htmlFor="non-vat-registered" className="text-sm">Non-VAT Registered</label>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          {/* Terms and Agreement */}
          <FormField
            control={form.control}
            name="termsAgreed"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="form-checkbox h-4 w-4 mt-1 text-primary border-gray-300 focus:ring-primary"
                    disabled={isUploading}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Terms and Conditions</FormLabel>
                  <FormDescription>
                    I agree to the <a href="#" className="text-primary underline">Terms and Conditions</a> and <a href="#" className="text-primary underline">Data Privacy Policy</a>
                  </FormDescription>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {isUploading && uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div 
                className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <p className="text-xs text-center mt-1 text-muted-foreground">
                Uploading: {uploadProgress}%
              </p>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              className="w-full md:w-auto" 
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Submit Verification'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SellerVerificationForm;
