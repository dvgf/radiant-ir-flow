
import { useState, useEffect } from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { fetchTemplates } from '@/lib/supabase';
import { Template } from '@/types';
import { 
  Plus, 
  FileText, 
  Loader2, 
  Trash2, 
  Edit, 
  Copy 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Templates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const data = await fetchTemplates();
        
        // Convert the data to match the Template interface
        const formattedTemplates = data.map(template => ({
          id: template.id,
          name: template.name,
          description: template.description || '',
          category: template.category,
          sections: typeof template.sections === 'string' 
            ? JSON.parse(template.sections) 
            : template.sections,
          variables: typeof template.variables === 'string' 
            ? JSON.parse(template.variables) 
            : template.variables,
          author: template.author || 'Unknown',
          created_at: template.created_at,
          updated_at: template.updated_at
        }));
        
        setTemplates(formattedTemplates);
      } catch (error) {
        console.error('Error loading templates:', error);
        toast({
          title: 'Error',
          description: 'Failed to load templates.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [toast]);

  // Only admins should access this page
  if (user?.role !== 'admin') {
    toast({
      title: 'Access Denied',
      description: 'You do not have permission to access this page.',
      variant: 'destructive',
    });
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Template Builder</h1>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Template
          </Button>
        </div>

        <p className="text-muted-foreground">
          Create and manage templates for procedure reports and documentation.
        </p>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-ir-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.length > 0 ? (
              templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{template.name}</CardTitle>
                        <CardDescription>{template.category}</CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {template.description}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-xs text-muted-foreground">
                      Last updated: {new Date(template.updated_at).toLocaleDateString()}
                    </div>
                    <Button variant="secondary" size="sm" className="gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <Card className="col-span-full">
                <CardHeader>
                  <CardTitle>No Templates Yet</CardTitle>
                  <CardDescription>
                    Create your first template to get started.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8 gap-4">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                    <p className="text-center text-muted-foreground">
                      Templates help standardize reporting and make documentation more efficient.
                    </p>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Templates;
