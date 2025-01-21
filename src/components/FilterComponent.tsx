import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown } from "lucide-react";

interface FilterComponentProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
}

const FilterComponent: React.FC<FilterComponentProps> = ({
  label,
  options,
  selectedValues,
  onSelectionChange,
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selectedValues.length === options.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange([...options]);
    }
  };

  const handleOptionToggle = (option: string) => {
    if (selectedValues.includes(option)) {
      onSelectionChange(selectedValues.filter(v => v !== option));
    } else {
      onSelectionChange([...selectedValues, option]);
    }
  };

  const isAllSelected = selectedValues.length === options.length;
  const selectedCount = selectedValues.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="h-10 px-3 flex items-center justify-between min-w-[200px] bg-white"
        >
          <span className="truncate">
            {selectedCount > 0
              ? `${label} (${selectedCount})`
              : label}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-[300px] p-2 bg-white"
        align="start"
      >
        <div className="space-y-2">
          <div className="px-2 pb-2 border-b">
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8"
            />
          </div>
          <div className="px-2 pb-2 border-b">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`${label}-select-all`}
                checked={isAllSelected}
                onClick={handleSelectAll}
              />
              <label
                htmlFor={`${label}-select-all`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Selecionar Todos
              </label>
            </div>
          </div>
          <ScrollArea className="h-[200px] px-2">
            <div className="space-y-2">
              {filteredOptions.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${label}-${option}`}
                    checked={selectedValues.includes(option)}
                    onClick={() => handleOptionToggle(option)}
                  />
                  <label
                    htmlFor={`${label}-${option}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterComponent;