"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AiChatSession } from "@/configs/AiModal";
import { useUser } from "@clerk/nextjs";
import { JsonForms } from "@/configs/schema";
import { db } from "@/configs";
import moment from "moment/moment";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const PROMPT ="The JSON must include formTitle and formSubheading.The form array should contain fields with the following attributes:formName (unique for each field)formLabelfieldType (must strictly be one of these: date, email, input, textarea, radio, checkbox, or select) placeholder  fieldRequired options (required strictly for radio and select fields; each option should include label and value). Do not include any other field types apart from date, email, input, textarea, radio, checkbox, and select. Ensure the JSON is in a valid format and involves just one unique formName per field"
  function CreateForm() {
  const [openDialog, setOpenDialog] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const { user } = useUser();
  const route = useRouter();

  const onCreateForm = async () => {
    if (!userInput.trim()) {
      setErrorMessage("Please provide a valid description.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await AiChatSession.sendMessage(
        "Description: " + userInput + PROMPT
      );
      const responseText = await result.response.text();

      console.log("AI Response:", responseText);

      if (responseText) {
        const rawJson = responseText.replace(/```json|```/g, "").trim();

        let formJson;
        try {
          formJson = JSON.parse(rawJson);
        } catch (e) {
          setErrorMessage("AI response is not valid JSON.");
          setLoading(false);
          return;
        }

        console.log("Parsed AI Response:", formJson);

        const resp = await db
          .insert(JsonForms)
          .values({
            jsonform: JSON.stringify(formJson),
            createdBy: user?.primaryEmailAddress?.emailAddress || "unknown",
            createdAt: moment().format("DD/MM/yyyy"),
          })
          .returning({ id: JsonForms.id });

        console.log("Database Insert Response:", resp);

        if (resp?.[0]?.id) {
          route.push("/edit-form/" + resp[0].id);
        } else {
          setErrorMessage("Failed to save the form in the database.");
        }
      } else {
        setErrorMessage("AI response was empty. Please try again.");
      }
    } catch (error) {
      console.error("Error creating form:", error);
      setErrorMessage("An error occurred while creating the form.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={() => setOpenDialog(true)}>+ Create Form</Button>
      <Dialog open={openDialog}>
        <DialogTrigger asChild></DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Form</DialogTitle>
            <DialogDescription>
              <Textarea
                className="my-2"
                onChange={(event) => setUserInput(event.target.value)}
                placeholder="Write description..."
              />
              {errorMessage && (
                <p className="text-red-500 my-2">{errorMessage}</p>
              )}
              <div className="flex gap-2 my-3 justify-end">
                <Button
                  variant="destructive"
                  onClick={() => setOpenDialog(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button disabled={loading} onClick={onCreateForm}>
                  {loading ? <Loader2 className="animate-spin" /> : "Create"}
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateForm;
