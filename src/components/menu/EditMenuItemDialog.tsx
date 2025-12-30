import React, { useState } from 'react';
import { FoodItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { categories } from '@/data/menuData';
import { ImagePlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EditMenuItemDialogProps {
  item: FoodItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<FoodItem>) => void;
}

const EditMenuItemDialog: React.FC<EditMenuItemDialogProps> = ({
  item,
  open,
  onOpenChange,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<FoodItem>>({});
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        preparationTime: item.preparationTime,
        image: item.image,
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    
    onSave(item.id, formData);
    toast.success(`${formData.name} updated successfully`);
    setIsLoading(false);
    onOpenChange(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In production, upload to storage bucket
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!item) return null;

  const categoryOptions = categories.filter((c) => c.id !== 'all');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Menu Item</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Item Image</Label>
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-muted">
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImagePlus className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG or WebP. Max 5MB.
                </p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={formData.price || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prepTime">Prep Time (mins)</Label>
              <Input
                id="prepTime"
                type="number"
                min="1"
                value={formData.preparationTime || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, preparationTime: Number(e.target.value) }))}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditMenuItemDialog;
