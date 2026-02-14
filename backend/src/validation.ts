import { z } from "zod";

export const severityEnum = z.enum(["SEV1", "SEV2", "SEV3", "SEV4"]);
export const statusEnum = z.enum(["OPEN", "MITIGATED", "RESOLVED"]);

export const createIncidentSchema = z.object({
  title: z.string().min(3).max(200),
  service: z.string().min(1).max(100),
  severity: severityEnum,
  status: statusEnum.default("OPEN"),
  owner: z.string().max(100).optional().nullable(),
  summary: z.string().max(1000).optional().nullable()
});

export const updateIncidentSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  service: z.string().min(1).max(100).optional(),
  severity: severityEnum.optional(),
  status: statusEnum.optional(),
  owner: z.string().max(100).optional().nullable(),
  summary: z.string().max(1000).optional().nullable()
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided to update"
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;

