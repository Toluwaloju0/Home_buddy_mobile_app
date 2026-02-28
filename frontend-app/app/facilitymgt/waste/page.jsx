"use client";
import React from 'react'
import Image from 'next/image';
import { IoTrashOutline } from "react-icons/io5";
import { MdOutlineSupportAgent } from "react-icons/md";
import { SlCalender } from "react-icons/sl";
import { IoCallOutline } from "react-icons/io5";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useForm } from "react-hook-form";

import Footer from '@/components/Footer';

const requests = [
  {
    title:"Find Your Local PSP Operator",
    icon: <MdOutlineSupportAgent className='h-full w-full text-3xl' />,
    description: "See the official waste collection provider assigned to your location",
  },
  {
    title: "View Pickup Schedule",
    icon: <SlCalender className='h-full w-full text-3xl' />,
    description: "Check collection days",
  },
  {
    title: "Request Pickups",
    icon: <IoTrashOutline className='h-full w-full text-3xl' />,
    description: "Instantly request pickup",
  },
  {
    title: "Contact Your PSP",
    icon: <IoCallOutline className='h-full w-full text-3xl' />,
    description: "Call or message your PSP operator"
  }
]

const page = () => {

  const form = useForm({
    defaultValues: {
      search: "",
    }
  });

   const onSubmit = (data) => {
    console.log(data);
    // Handle form submission here (e.g., search functionality)
  };

  return (
    <div>
      <div className='container mx-auto px-4 py-8 md:px-10 md:py-8 mb-8 flex flex-col items-center gap-3 justify-center'>
        <div className='h-50 w-50 flex relative'>
          <Image src="/assets/waste.png" fill className="object-cover"/>
        </div>
        <div className='flex flex-col items-center justify-center'>
          <p className='text-3xl font-bold mb-4'>Waste Collection (Coming Soon)</p>
          <p className='text-sm text-gray-400'>Manage waste pickups and connect with PSP operators</p>
        </div>
      </div>

      {/*  */}
      <div className='container mx-auto px-4 py-8 md:px-10 md:py-8 mb-8 flex flex-col items-center gap-3 justify-center'>
        <div className='flex flex-wrap flex-col md:flex-row gap-8 justify-center'>
          {requests.map((item, index) => (
            <div key={index} className='flex flex-col items-center gap-4 justify-center max-w-[400px]'>
              <p className='font-bold'>{item.title}</p>
              <div className='h-10 w-10 bg-gray-300 rounded-sm p-2'>{item.icon}</div>
              <p className='text-sm text-gray-400 text-center'>{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* stay updated */}
      <div className='container mx-auto px-4 py-8 md:px-10 md:py-8 mb-8 flex flex-col items-center gap-3 justify-center'>
        <div className='mb-4'>
          <p className='text-center font-bold text-4xl mb-4'>Want to stay updated?</p>
          <p className='text-center font-sm text-gray-400'>We'll notify you when this feature goes live.</p>
        </div>

        <div className='flex gap-4 items-center'>
          <Form {...form}>
            <form onsubmit  className='w-full '>
              <FormField control={form.control} name="search" render={({ field }) => (
                <FormItem className="relative">
                 {/*  <FormLabel className=" ">Enter your email</FormLabel> */}
                  <FormControl>
                    <div>
                      <Input 
                        placeholder="Enter your email"
                        className="w-full placeholder:text-gray-400 border border-gray-300 hover:border-gray-400 foucs:ring-1 focus:ring-blue-500 text-gray-400 pl-4 pr-4 py-6 rounded-lg font-medium transition-colors outline-none"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
              />
            </form>
          </Form>

          <div className="flex">
            <Link href="/">
              <Button className="px-8 py-6">notify me</Button>
            </Link>
          </div>

        </div>
      </div>

      {/* footer */}
        <Footer />
    </div>
  )
}

export default page