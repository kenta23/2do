import * as z from "zod";
import dayjs from "dayjs";

export const Taskschema = z.object({
  content: z
    .string({
      message: "Content is required",
      required_error: "Content is required",
      invalid_type_error: "Invalid content",
    })
    .min(1)
    .max(100),
  duedate: z
    .date({ invalid_type_error: "Remind me date is invalid" })
    .nullable()
    .optional()
    .refine((value) => (value ? value.getTime() >= dayjs().valueOf() : true), {
      message: "The Due Date should be in today or later",
      path: ["duedate"],
    }),

  remindme: z
    .date({
      invalid_type_error: "Remind me date is invalid",
    })
    .nullable()
    .optional()
    .refine((value) => (value ? value.getTime() >= dayjs().valueOf() : true), {
      message: "The Date should be in today or later",
      path: ["remindme"],
    }),
});

//FOR EDITING SINGLE TASK
export const editSchemawithID = z.object({
  id: z.string().min(1),
  ...Taskschema.omit({ remindme: true }).shape,
});

//FOR EDITING SINGLE TASK
// export const editSchemawithID = z.object({
//     id: z.string({ required_error: "ID is required" }).min(1),
//     content: z.string({ message: "Content is required" }).min(1),
//     duedate: z
//       .date()
//       .nullable()
//       .optional()
//       .refine((value) => (value ? value.getTime() >= dayjs().valueOf() : true), {
//         message: "The Date should be in today or later",
//         path: ["duedate"],
//       }),
//   });

export type FormData = z.infer<typeof Taskschema>;
export type editFormData = z.infer<typeof editSchemawithID>;
