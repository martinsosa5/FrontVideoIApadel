import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().min(1, "El nombre de la zona es obligatorio"),
  teams: z.array(z.string()).min(1, "Debe seleccionar al menos un equipo para la zona"),
  qualificationRule: z.string().optional()
});