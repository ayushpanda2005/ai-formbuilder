"use client";

import { db } from "@/configs";
import { JsonForms } from "@/configs/schema";
import { useUser } from "@clerk/nextjs";
import { and, eq } from "drizzle-orm";
import { ArrowLeft, Share2, SquareArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import FormUi from "../_components/FormUi";
import { toast } from "sonner";
import Controller from "@/app/dashboard/_components/Controller";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RWebShare } from "react-web-share";

function EditForm({ params }) {
  const { user } = useUser();
  const [jsonForm, setJsonForm] = useState(null);
  const [record, setRecord] = useState(null);
  const [updateTrigger, setUpdateTrigger] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("light");
  const [selectedBackground, setSelectedBackground] = useState();
  const [selectedStyle, setSelectedStyle] = useState();
  const router = useRouter();

  // Handle params if it is a Promise
  const formId = React.use(params)?.formId || params?.formId;

  const deleteField = (indexToRemove) => {
    if (!jsonForm?.formFields) {
      console.error("Invalid form data or fields not available.");
      return;
    }

    const updatedFields = jsonForm.formFields.filter(
      (_, index) => index !== indexToRemove
    );

    setJsonForm((prevState) => ({
      ...prevState,
      formFields: updatedFields,
    }));

    setUpdateTrigger(true);
  };

  const updateControllerFields = async (value, columnName) => {
    try {
      const result = await db
        .update(JsonForms)
        .set({ [columnName]: value })
        .where(
          and(
            eq(JsonForms.id, record.id),
            eq(JsonForms.createdBy, user?.primaryEmailAddress?.emailAddress)
          )
        )
        .returning({ id: JsonForms.id });

      console.log(`Column "${columnName}" updated:`, result); // Log the updated column
      toast("Updated");
    } catch (error) {
      console.error("Error updating column:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFormData();
    }
  }, [user]);

  const fetchFormData = async () => {
    try {
      const result = await db
        .select()
        .from(JsonForms)
        .where(
          and(
            eq(JsonForms.id, formId),
            eq(JsonForms.createdBy, user?.primaryEmailAddress?.emailAddress)
          )
        );

      if (result?.length) {
        const rawJson = result[0].jsonform;
        try {
          const parsedJson = JSON.parse(rawJson.replace(/```json|```/g, "").trim());
          setRecord(result[0]);
          setJsonForm(parsedJson);
          setSelectedBackground(result[0].background);
          setSelectedTheme(result[0].theme)
          setSelectedStyle(parsedJson.style)
          // doubts
        } catch (error) {
          console.error("Invalid JSON format:", rawJson, error);
        }
      } else {
        console.error("No data found for the provided form ID.");
      }
    } catch (error) {
      console.error("Error fetching form data:", error);
    }
  };

  useEffect(() => {
    if (updateTrigger && jsonForm) {
      updateJsonFormInDb();
      setUpdateTrigger(false);
    }
  }, [updateTrigger, jsonForm]);

  const onFieldUpdate = (value, index) => {
    if (!jsonForm?.formFields?.[index]) {
      console.error("Invalid field index or form data.");
      return;
    }

    const updatedFormFields = [...jsonForm.formFields];
    updatedFormFields[index] = { ...updatedFormFields[index], ...value };

    setJsonForm((prevState) => ({
      ...prevState,
      formFields: updatedFormFields,
    }));

    setUpdateTrigger(true);
  };

  const updateJsonFormInDb = async () => {
    if (!record?.id) {
      console.error("Record data is not available.");
      return;
    }

    try {
      const result = await db
        .update(JsonForms)
        .set({ jsonform: JSON.stringify(jsonForm) })
        .where(
          and(
            eq(JsonForms.id, record.id),
            eq(JsonForms.createdBy, user?.primaryEmailAddress?.emailAddress)
          )
        )
        .returning({ id: JsonForms.id });

      console.log("Database updated with jsonForm:", result); // Log the database response
      toast("Updated");
    } catch (error) {
      console.error("Error updating the database:", error);
    }
  };

  return (
    <div className={`p-10 ${selectedTheme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      <div className="flex justify-between items-center">
      <h2
        className="flex gap-2 items-center my-5 cursor-pointer hover:font-bold transition-all"
        onClick={() => router.back()}
      >
        <ArrowLeft /> Back
      </h2>
      <div className="flex gap-2">
        <Link href={"/aiform/" + record?.id} target="_blank">
        <Button className="flex gap-2"> <SquareArrowUpRight className="h-5 w-5"/>Live Preview</Button>
        </Link>
        <RWebShare
        data={{
          text: jsonForm?.formHeading+" Build your form in seconds with AI form builder",
          url: process.env.NEXT_PUBLIC_BASE_URL+"/aiform"+record?.id,
          title: jsonForm?.formTitle,
        }}
        onClick={() => console.log("shared successfully!")}
      >
        <Button className="flex gap-2 bg-green-500 hover:bg-green-700"> <Share2/>Share</Button>
      </RWebShare>
        
      </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 border rounded-lg shadow-md">
          <Controller
            selectedTheme={(value) => {
              updateControllerFields(value, "theme");
              setSelectedTheme(value);
            }}
            selectedBackground={(value) => {
              updateControllerFields(value, "background");
              setSelectedBackground(value)
            }}
            selectedStyle={(value) => {
              setSelectedStyle(value);
              updateControllerFields(value, 'style')}}
              setSignInEnable={(value)=>{
                updateControllerFields(value, "enabledSignIn");
              
            }}
          />
        </div>
        <div
          className="md:col-span-2 border rounded-lg p-5 flex items-center justify-center"
          style={{
            backgroundImage: selectedBackground,
          }}
        >
          {jsonForm ? (
            <FormUi
              selectedTheme={selectedTheme}
              selectedStyle={selectedStyle}
              jsonForm={jsonForm}
              onFieldUpdate={onFieldUpdate}
              deleteField={(index) => deleteField(index)}
            />
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditForm;
