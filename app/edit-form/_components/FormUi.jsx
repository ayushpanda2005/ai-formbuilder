import React, { useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import FieldEdit from "./FieldEdit";
import { db } from "@/configs";
import { userResponses } from "@/configs/schema";
import moment from "moment";
import { toast } from "sonner";
import { SignInButton, useUser } from "@clerk/nextjs";


function FormUi({
  jsonForm,
  onFieldUpdate,
  deleteField,
  selectedTheme,
  selectedStyle,
  editable = true,
  formId = 0,
  enabledSignIn=false
}) {
  const initialFormData = jsonForm?.form?.reduce((acc, field) => {
    if (field.fieldType === "checkbox") {
      acc[field.formName] = []; // Initialize as an array for checkboxes
    } else {
      acc[field.formName] = "";
    }
    return acc;
  }, {});
  const formRef = useRef();
  const {user,isSignedIn} = useUser()

  const [formData, setFormData] = useState(initialFormData);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (name, value, isChecked) => {
    setFormData((prev) => {
      const updatedValues = isChecked
        ? [...prev[name], value]
        : prev[name].filter((item) => item !== value);
      return {
        ...prev,
        [name]: updatedValues,
      };
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRadioChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onFormSubmit = async (event) => {
    event.preventDefault();
    console.log("Form Data Submitted:", formData);

    try {
      const result = await db.insert(userResponses).values({
        jsonResponse: formData,
        createdAt: moment().format("DD/MM/yyyy"),
        formRef: formId,
      });

      if (result) {
        formRef.current.reset();
        toast("Response Submitted Successfully!");
      } else {
        toast("Oops! Server error!");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast("Error submitting the form. Please try again.");
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={onFormSubmit}
      className="border p-5 md:w-[600px] rounded-lg"
      data-theme={selectedTheme}
      style={{
        boxShadow: selectedStyle?.key === "boxshadow" && "5px 5px 0px black",
        border: selectedStyle?.key === "border" && selectedStyle.value,
      }}
    >
      <div className="container mx-auto p-5">
        <div className="max-w-2xl mx-auto p-5 border rounded-lg shadow-lg">
          <h2 className="font-bold text-center text-2xl mb-3">
            {jsonForm?.formTitle || "Untitled Form"}
          </h2>
          {jsonForm?.formSubheading && (
            <h3 className="text-sm text-center mb-6">
              {jsonForm?.formSubheading}
            </h3>
          )}
          {jsonForm?.form?.map((field, index) => (
            <div key={index} className="flex flex-col gap-2 mb-4">
              {field.fieldType === "select" && (
                <div className="my-3 w-full">
                  <label className="block text-sm font-semibold mb-2">
                    {field.formLabel}
                  </label>
                  <Select
                    required={field.fieldRequired}
                    onValueChange={(value) =>
                      handleSelectChange(field.formName, value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((item, idx) => (
                        <SelectItem key={idx} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {field.fieldType === "textarea" && (
                <div className="my-3 w-full">
                  <label htmlFor={field.formName} className="block mb-2">
                    {field.formLabel}
                  </label>
                  <textarea
                    id={field.formName}
                    name={field.formName}
                    placeholder={field.placeholder}
                    required={field.fieldRequired}
                    onChange={(e) =>
                      handleInputChange(field.formName, e.target.value)
                    }
                    className="w-full"
                  ></textarea>
                </div>
              )}
              {field.fieldType === "checkbox" && (
                <div className="my-3 w-full">
                  <label className="block text-sm font-semibold mb-2">
                    {field.formLabel}
                  </label>
                  {field.options?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Checkbox
                        id={`${field.formName}-${idx}`}
                        onCheckedChange={(isChecked) =>
                          handleCheckboxChange(
                            field.formName,
                            item.value,
                            isChecked
                          )
                        }
                      />
                      <Label htmlFor={`${field.formName}-${idx}`}>
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
              {field.fieldType === "radio" && (
                <div className="my-3 w-full">
                  <label className="block text-sm font-semibold mb-2">
                    {field.formLabel}
                  </label>
                  <RadioGroup
                    onValueChange={(value) =>
                      handleRadioChange(field.formName, value)
                    }
                  >
                    {field.options?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <RadioGroupItem
                          value={item.value}
                          id={`${field.formName}-${idx}`}
                        />
                        <Label htmlFor={`${field.formName}-${idx}`}>
                          {item.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
              {field.fieldType === "input" && (
                <div className="mb-6 w-full">
                  <label htmlFor={field.formName} className="block mb-2">
                    {field.formLabel}
                  </label>
                  <Input
                    id={field.formName}
                    type={field.inputType || "text"} // Defaults to 'text' if inputType is not specified
                    placeholder={field.placeholder}
                    name={field.formName}
                    required={field.fieldRequired}
                    onChange={(e) =>
                      handleInputChange(field.formName, e.target.value)
                    }
                  />
                </div>
              )}
              {[
                "text",
                "email",
                "tel",
                "date",
                "password",
              ].includes(field.fieldType) && (
                <div className="mb-6 w-full">
                  <label htmlFor={field.formName} className="block mb-2">
                    {field.formLabel}
                  </label>
                  <Input
                    id={field.formName}
                    type={field.fieldType}
                    placeholder={field.placeholder}
                    name={field.formName}
                    required={field.fieldRequired}
                    onChange={(e) =>
                      handleInputChange(field.formName, e.target.value)
                    }
                  />
                </div>
              )}
              {editable && (
                <FieldEdit
                  defaultValue={{ ...field, index }}
                  onUpdate={(value) => onFieldUpdate(value, index)}
                  deleteField={deleteField}
                />
              )}
            </div>
          ))}
         {!enabledSignIn ? (
  <button
    type="submit"
    className="btn btn-primary mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
  >
    Submit
  </button>
) : isSignedIn ? (
  <button
    type="submit"
    className="btn btn-primary mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
  >
    Submit
  </button>
) : (
  <SignInButton mode="modal">Sign In before Submit</SignInButton>
)}

          
        </div>
      </div>
    </form>
  );
}

export default FormUi;
