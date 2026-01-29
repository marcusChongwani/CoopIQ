import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Video, Star } from 'lucide-react';

export default function AdminDashboard() {
  const { data: booksCount } = useQuery({
    queryKey: ['admin-books-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('books')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const { data: videosCount } = useQuery({
    queryKey: ['admin-videos-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const { data: featuredBooksCount } = useQuery({
    queryKey: ['admin-featured-books-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('books')
        .select('*', { count: 'exact', head: true })
        .eq('featured', true);
      return count || 0;
    },
  });

  const { data: featuredVideosCount } = useQuery({
    queryKey: ['admin-featured-videos-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true })
        .eq('featured', true);
      return count || 0;
    },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{booksCount ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Featured Books</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{featuredBooksCount ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{videosCount ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Featured Videos</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{featuredVideosCount ?? 0}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
