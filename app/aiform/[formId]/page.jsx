"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import FormUi from "@/app/edit-form/_components/FormUi";
import { db } from "@/configs";
import { JsonForms } from "@/configs/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";

export default function LiveAiForm() {
  const params = useParams();         // 👈 get params from App Router
  const formId = params.formId;       // 👈 extract formId
  const [record, setRecord] = useState(null);
  const [jsonForm, setJsonForm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (formId) {
      GetFormData(formId);
    }
  }, [formId]);

  const GetFormData = async (formIdString) => {
    const id = parseInt(formIdString, 10);
    if (isNaN(id)) {
      console.error("Invalid form ID:", formIdString);
      setIsLoading(false);
      return;
    }

    try {
      const result = await db
        .select()
        .from(JsonForms)
        .where(eq(JsonForms.id, id));

      if (result.length > 0) {
        const rawJson = result[0]?.jsonform;
        if (rawJson) {
          const parsedJson = JSON.parse(
            rawJson.replace(/```json|```/g, "").trim()
          );
          setRecord(result[0]);
          setJsonForm(parsedJson);
        }
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
            selectedStyle={JSON.parse(record?.style || "{}")}
            selectedTheme={record?.theme || "default"}
            editable={false}
            formId={record.id}
            enabledSignIn={record?.enabledSignIn}
          />
          <Link href="/">
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

