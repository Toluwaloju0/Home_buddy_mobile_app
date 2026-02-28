"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlineCall } from "react-icons/md";
import { FaRegEnvelope } from "react-icons/fa";

import Footer from "@/components/Footer";

const Page = () => {
  const formSchema = z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters.")
      .max(50, "Name must be at most 50 characters."),
    email: z
      .string()
      .email("Please enter a valid email address."),
    phone: z
      .string()
      .optional()
      .refine((val) => !val || val.length >= 11, {
        message: "Phone number must be at least 11 digits",
      })
      .refine((val) => !val || /^\d+$/.test(val), {
        message: "Phone number must contain only digits",
      }),
    subject: z
    .string()
    .min(10, "Subject must be at least 10 characters.")
    .max(500, "Subject must be at most 500 characters."),
    message: z
      .string()
      .min(10, "Message must be at least 10 characters.")
      .max(500, "Message must be at most 500 characters."),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = (data) => {
    console.log(data);
    // Handle form submission here (e.g., send to API)
    alert("Form submitted successfully!");
  };

  return (
    <div>
      <div className='container mx-auto px-4 py-8 md:px-6 md:py-10 lg:px-20'>
        <div className='grid grid-cols-1 sm:grid-cols-2 min-h-[50vh] place-items-center place-content-start px-12'>
          <div className="order-2 xl:order-none">
            <h1 className='text-3xl font-bold mb-3'>We&apos;re Here to Help</h1>
            <p className='text-sm text-gray-500'>Contact our team for support, enquiries, feedback, or partnership opportunities.</p>
          </div>
          <div className="w-full order-1 xl:order-none px-4">
            <div
              className="
                relative 
                overflow-hidden
                rounded-3xl
                [clip-path:polygon(5%_0%,100%_0%,100%_100%,0%_100%)]
              "
            >
              <Image
                src="/assets/contact.jpg"
                alt="Customer support agent"
                width={800}
                height={600}
                className="object-cover"
              />
            </div>
          </div>
        </div>
        {/* contact Information & send us a message */}
        <div className="grid grid-cols-1 sm:grid-cols-2 min-h-screen place-items-start place-content-center px-12">
          {/* left column - contact information */}
          <div className="flex flex-col gap-3 p-4">
            <h1 className="text-3xl font-bold">Contact Information</h1>
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 bg-gray-300 rounded-sm p-2">
                <IoLocationOutline className="h-full w-full text-black" />
              </div>
              <div>
                <p className="font-semibold text-xs mb-1">123 Home Buddy St,</p>
                <p className="text-gray-400 text-xs">Ikorodo, Lagos, Nigeria</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 bg-gray-300 rounded-sm p-2">
                <MdOutlineCall className="h-full w-full text-black" />
              </div>
              <div>
                <p className="font-semibold text-xs mb-1">+234 800 000 0000</p>
                <p className="text-gray-400 text-xs">Customer Care</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 bg-gray-300 rounded-sm p-2">
                <FaRegEnvelope className="h-full w-full text-black" />
              </div>
              <div>
                <p className="font-semibold text-xs mb-1">support@homebuddy.ng</p>
                <p className="text-gray-400 text-xs">Support Team</p>
              </div>
            </div>
          </div>
          {/* send us a message */}
          <div className="w-full">
            <Card className="w-full sm:max-w-md">
              <CardHeader>
                <CardTitle className="text-3xl font-bold">Send Us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we will get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form id="form-submit" onSubmit={form.handleSubmit(onSubmit)}>
                  <FieldGroup>
                    <Controller
                      name="name"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="field-name">Full Name <span className="text-red-500">*</span></FieldLabel>
                          <FieldError>{fieldState.error?.message}</FieldError>
                          <Input
                            {...field}
                            id="field-name"
                            placeholder=""
                            aria-invalid={fieldState.invalid}
                            autoComplete="off"
                          />
                        </Field>
                      )}
                    />

                    <Controller
                      name="email"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="field-email">Email <span className="text-red-500">*</span></FieldLabel>
                          <FieldError>{fieldState.error?.message}</FieldError>
                          <Input
                            {...field}
                            id="field-email"
                            placeholder=""
                            type="email"
                            aria-invalid={fieldState.invalid}
                            autoComplete="off"
                          />
                        </Field>
                      )}
                    />

                    <Controller
                      name="phone"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="field-phone">Phone Number</FieldLabel>
                          <FieldError>{fieldState.error?.message}</FieldError>
                          <Input
                            {...field}
                            id="field-phone"
                            placeholder=""
                            type="tel"
                            aria-invalid={fieldState.invalid}
                            autoComplete="off"
                          />
                        </Field>
                      )}
                    />

                    <Controller
                      name="subject"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="field-subject">Subject <span className="text-red-500">*</span></FieldLabel>
                          <FieldError>{fieldState.error?.message}</FieldError>
                          <Input
                            {...field}
                            id="field-subject"
                            placeholder=""
                            type="subject"
                            aria-invalid={fieldState.invalid}
                            autoComplete="off"
                          />
                        </Field>
                      )}
                    />


                    <Controller
                      name="message"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="field-message">Message <span className="text-red-500">*</span></FieldLabel>
                          <FieldError>{fieldState.error?.message}</FieldError>
                          <textarea
                            {...field}
                            id="field-message"
                            placeholder="Enter your message"
                            className="w-full min-h-[100px] p-2 border rounded-md"
                            aria-invalid={fieldState.invalid}
                          />
                        </Field>
                      )}
                    />
                  </FieldGroup>

                  <Button type="submit" className="mt-4 w-full text-center text-xs py-3">Send Message</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Page;