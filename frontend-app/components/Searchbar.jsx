"use client";

import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaLocationArrow } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";

export default function SearchBar() {
  const form = useForm({
    defaultValues: {
      type: "buy",
      location: "",
    },
  });

  const onSubmit = (values) => {
    console.log("Search values:", values);
    // You can redirect, filter listings, call API, etc.
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl px-3 py-3 sm:px-4 sm:py-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2"
      >
        {/* Mobile: First row - Type select and Search button */}
        <div className="flex items-center justify-between sm:hidden">
          {/* Buy/Rent select */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="flex-1">
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="[&>svg:not(.custom-arrow)]:hidden border border-gray-200 shadow-sm px-3 py-2 h-auto text-sm flex items-center justify-between w-full">
                    <SelectValue placeholder="Buy" />
                    <IoMdArrowDropdown className="custom-arrow text-gray-500 ml-2" style={{ fontSize: "2rem", height:"22px", width:"22px" }} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy" className="text-sm">Buy</SelectItem>
                    <SelectItem value="rent" className="text-sm">Rent</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          
          {/* Search button for mobile */}
          <Button 
            type="submit" 
            className="ml-2 bg-gray-500 hover:bg-gray-700 text-white rounded-lg px-4 py-2 h-auto min-w-[60px]"
          >
            <CiSearch size={20} />
          </Button>
        </div>

        {/* Desktop: Type select */}
        <div className="hidden sm:block">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="border-none shadow-none [&>svg:not(.custom-arrow)]:hidden flex items-center text-gray-500 text-sm sm:text-md">
                    <SelectValue placeholder="Buy" />
                    <IoMdArrowDropdown className="custom-arrow text-gray-500" style={{ fontSize: "2rem", height:"22px", width:"22px" }} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">Buy</SelectItem>
                    <SelectItem value="rent">Rent</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        {/* Separator - Desktop only */}
        <div className="hidden sm:flex items-center">
          <div className="text-gray-300">|</div>
        </div>

        {/* Location input - Full width on mobile */}
        <div className="flex-1">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="w-full">
                <div className="relative">
                  <FaLocationArrow className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 sm:text-gray-500 z-10" size={16} />
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter location or use current"
                      className="pl-10 pr-3 sm:pl-9 py-2 sm:py-2 text-sm border border-gray-200 sm:border-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 rounded-lg sm:rounded-none sm:shadow-none focus-visible:ring-1 focus-visible:ring-gray-300 w-full"
                    />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Search button - Desktop only */}
        <div className="hidden sm:block">
          <Button 
            type="submit" 
            size="icon" 
            variant="ghost" 
            className="hover:bg-gray-100 rounded-full"
          >
            <CiSearch className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600" />
          </Button>
        </div>

        
      </form>
    </Form>
  );
}