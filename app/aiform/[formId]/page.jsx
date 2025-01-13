"use client";
import FormUi from "@/app/edit-form/_components/FormUi";
import { db } from "@/configs";
import { JsonForms } from "@/configs/schema";
import { eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

function LiveAiForm({ params }) {
  const [record, setRecord] = useState(null); // Store record from DB
  const [jsonForm, setJsonForm] = useState(null); // Store parsed JSON form
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
  if (params?.formId) {
    console.log("Received params:", params); // Debug params
    GetFormData(params.formId);
  } else {
    console.error("Params are missing or invalid:", params);
    setIsLoading(false);
  }
}, [params]);


  const GetFormData = async (formIdString) => {
    const formId = parseInt(formIdString, 10); // Ensure formId is parsed as a number

    if (isNaN(formId)) {
      console.error("Invalid form ID:", formIdString);
      setIsLoading(false);
      return;
    }

    try {
      console.log("Fetching data for form ID:", formId);
      const result = await db
        .select()
        .from(JsonForms)
        .where(eq(JsonForms.id, formId));

      if (result.length > 0) {
        console.log("Database result:", result);
        const rawJson = result[0]?.jsonform;

        if (rawJson) {
          try {
            const parsedJson = JSON.parse(
              rawJson.replace(/```json|```/g, "").trim()
            );

            setRecord(result[0]);
            setJsonForm(parsedJson);
            console.log("Parsed JSON form:", parsedJson);
          } catch (parseError) {
            console.error("Error parsing JSON form:", parseError);
          }
        } else {
          console.error("No `jsonform` found in database result:", result);
        }
      } else {
        console.error("No data found for the provided form ID.");
      }
    } catch (error) {
      console.error("Error fetching form data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="p-10 flex justify-center items-center"
      style={{
        backgroundImage: record?.background,
      }}
    >
      {isLoading ? (
        <p>Loading form data...</p>
      ) : record && jsonForm ? (
        <>
          <FormUi
            jsonForm={jsonForm}
            onFieldUpdate={() => console.log("Field updated")}
            deleteField={() => console.log("Field deleted")}
            selectedStyle={JSON.parse(record?.style || "{}")} // Safely access `style`
            selectedTheme={record?.theme || "default"} // Safely access `theme`
            editable={false}
            formId={record.id}
            enabledSignIn={record?.enabledSignIn}
          />


          <Link href="http://localhost:3000/">
            <div
              className="flex gap-2 items-center bg-black text-white px-3 py-1 
              rounded-full fixed bottom-5 left-5 cursor-pointer"
            >
              <Image src="/logo.png" alt="Logo" width={25} height={25} />
              Draft Now!
            </div>
          </Link>
        </>
      ) : (
        <p>No data available for the provided form ID.</p>
      )}
    </div>
  );
}

export default LiveAiForm;
