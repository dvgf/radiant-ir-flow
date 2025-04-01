
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Provider } from '@/types';

interface ProviderSelectorProps {
  providers: Provider[];
  selectedProviderId: string;
  onProviderChange: (providerId: string) => void;
  loading: boolean;
}

const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  providers,
  selectedProviderId,
  onProviderChange,
  loading
}) => {
  return (
    <div>
      <Label htmlFor="provider">Provider</Label>
      <Select
        value={selectedProviderId}
        onValueChange={onProviderChange}
        disabled={loading}
      >
        <SelectTrigger id="provider" className="w-full">
          <SelectValue placeholder={loading ? "Loading providers..." : "Select a provider"} />
        </SelectTrigger>
        <SelectContent position="popper" className="max-h-80 overflow-y-auto bg-background">
          {loading ? (
            <div className="p-4 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Loading providers...</span>
            </div>
          ) : providers.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No providers available in database
            </div>
          ) : (
            providers.map((provider) => (
              <SelectItem key={provider.id} value={provider.id}>
                {provider.name || `${provider.initials} (${provider.provider_id})`}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProviderSelector;
