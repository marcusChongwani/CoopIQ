import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Upload, FileText, Image, Loader2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Book = Tables<'books'>;

interface BookFormData {
  title: string;
  subtitle: string;
  description: string;
  price: number;
  featured: boolean;
  cover_image: string;
  file_path: string;
}

const initialFormData: BookFormData = {
  title: '',
  subtitle: '',
  description: '',
  price: 10,
  featured: false,
  cover_image: '',
  file_path: '',
};

const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export default function AdminBooks() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState<BookFormData>(initialFormData);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: books, isLoading } = useQuery({
    queryKey: ['admin-books'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const uploadCoverImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    
    setIsUploadingCover(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from('book-covers')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('book-covers')
        .getPublicUrl(fileName);
      
      setFormData(prev => ({ ...prev, cover_image: publicUrl }));
      toast({ title: 'Cover image uploaded successfully' });
    } catch (error: any) {
      toast({ title: 'Error uploading cover image', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploadingCover(false);
    }
  };

  const uploadPdfFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    
    setIsUploadingPdf(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from('book-files')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      setFormData(prev => ({ ...prev, file_path: fileName }));
      toast({ title: 'PDF file uploaded successfully' });
    } catch (error: any) {
      toast({ title: 'Error uploading PDF file', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: BookFormData & { slug: string }) => {
      const { error } = await supabase.from('books').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-books'] });
      toast({ title: 'Book created successfully' });
      closeDialog();
    },
    onError: (error) => {
      toast({ title: 'Error creating book', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BookFormData> }) => {
      const { error } = await supabase.from('books').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-books'] });
      toast({ title: 'Book updated successfully' });
      closeDialog();
    },
    onError: (error) => {
      toast({ title: 'Error updating book', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('books').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-books'] });
      toast({ title: 'Book deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting book', description: error.message, variant: 'destructive' });
    },
  });

  const toggleFeatured = useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      const { error } = await supabase.from('books').update({ featured }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-books'] });
    },
    onError: (error) => {
      toast({ title: 'Error updating featured status', description: error.message, variant: 'destructive' });
    },
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingBook(null);
    setFormData(initialFormData);
  };

  const openEditDialog = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      subtitle: book.subtitle || '',
      description: book.description || '',
      price: book.price,
      featured: book.featured,
      cover_image: book.cover_image || '',
      file_path: book.file_path || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBook) {
      updateMutation.mutate({ id: editingBook.id, data: formData });
    } else {
      createMutation.mutate({ ...formData, slug: generateSlug(formData.title) });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Books</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingBook(null); setFormData(initialFormData); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Book
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBook ? 'Edit Book' : 'Add New Book'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (ZMW)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  required
                />
              </div>
              
              {/* Cover Image Upload */}
              <div className="space-y-2">
                <Label>Cover Image</Label>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadCoverImage(file);
                  }}
                />
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={isUploadingCover}
                  >
                    {isUploadingCover ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Image className="mr-2 h-4 w-4" />
                    )}
                    {isUploadingCover ? 'Uploading...' : 'Upload Cover'}
                  </Button>
                  {formData.cover_image && (
                    <div className="flex items-center gap-2">
                      <img 
                        src={formData.cover_image} 
                        alt="Cover preview" 
                        className="h-12 w-12 object-cover rounded"
                      />
                      <span className="text-sm text-muted-foreground">Cover uploaded</span>
                    </div>
                  )}
                </div>
              </div>

              {/* PDF File Upload */}
              <div className="space-y-2">
                <Label>Book PDF File</Label>
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadPdfFile(file);
                  }}
                />
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => pdfInputRef.current?.click()}
                    disabled={isUploadingPdf}
                  >
                    {isUploadingPdf ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="mr-2 h-4 w-4" />
                    )}
                    {isUploadingPdf ? 'Uploading...' : 'Upload PDF'}
                  </Button>
                  {formData.file_path && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      PDF uploaded
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
                <Label htmlFor="featured">Featured</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending || isUploadingCover || isUploadingPdf}>
                  {editingBook ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cover</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>PDF</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books?.map((book) => (
              <TableRow key={book.id}>
                <TableCell>
                  {book.cover_image ? (
                    <img src={book.cover_image} alt={book.title} className="h-12 w-10 object-cover rounded" />
                  ) : (
                    <div className="h-12 w-10 bg-muted rounded flex items-center justify-center">
                      <Image className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{book.title}</TableCell>
                <TableCell>K{book.price}</TableCell>
                <TableCell>
                  {book.file_path ? (
                    <span className="text-primary flex items-center gap-1">
                      <FileText className="h-4 w-4" /> Yes
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No</span>
                  )}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={book.featured}
                    onCheckedChange={(checked) => toggleFeatured.mutate({ id: book.id, featured: checked })}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(book)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this book?')) {
                        deleteMutation.mutate(book.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
