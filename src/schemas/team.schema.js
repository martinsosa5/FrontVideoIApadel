import { z } from "zod";

export const createTeamSchema = z.object({
  player1: z.string().min(1, "Seleccionar el jugador 1 es obligatorio"),
  player2: z.string().min(1, "Seleccionar el jugador 2 es obligatorio"),
}).refine((data) => data.player1 !== data.player2, {
  message: "Un jugador no puede hacer pareja consigo mismo",
  path: ["player2"], // El error va a saltar en el segundo selector
});