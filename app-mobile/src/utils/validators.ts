import { z } from 'zod';

/** Login */
export const loginSchema = z.object({
  email: z.string().email('Informe um e-mail válido'),
  password: z.string().min(6, 'Mínimo de 6 caracteres')
});
export type LoginForm = z.infer<typeof loginSchema>;

/** Apenas letras e números, obrigatoriamente MAIÚSCULAS */
const PROC_NUM_REGEX = /^[A-Z0-9]+$/;

/** Processo informado manualmente */
export const processoSchema = z.object({
  processNumber: z.string()
    .min(5, 'Número muito curto')
    .max(20, 'Número muito longo')
    .regex(PROC_NUM_REGEX, 'Use apenas letras e números em MAIÚSCULAS (ex: MCZAD17656)'),
  tipo: z.enum(['AHL','DPR','OHD']),
  cliente: z.string().optional(),
  pnr: z.string().optional(),
  bag: z.string().optional(),
  dano: z.string().optional(),
  solucao: z.enum(['Conserto','Mala nova','Voucher','Não há tratativas']).optional()
})
.superRefine((data, ctx) => {
  if (data.tipo === 'AHL') {
    if (!data.cliente) ctx.addIssue({ code: 'custom', path: ['cliente'], message: 'Cliente é obrigatório em AHL' });
    if (!data.pnr)     ctx.addIssue({ code: 'custom', path: ['pnr'],     message: 'PNR é obrigatório em AHL' });
    if (!data.bag)     ctx.addIssue({ code: 'custom', path: ['bag'],     message: 'Descrição da bag é obrigatória em AHL' });
  }
  if (data.tipo === 'DPR') {
    if (!data.dano)    ctx.addIssue({ code: 'custom', path: ['dano'],    message: 'Descreva o dano em DPR' });
    if (!data.solucao) ctx.addIssue({ code: 'custom', path: ['solucao'], message: 'Selecione a solução em DPR' });
  }
  if (data.tipo === 'OHD') {
    if (!data.bag)     ctx.addIssue({ code: 'custom', path: ['bag'],     message: 'Descrição da bag é obrigatória em OHD' });
  }
});

export type ProcessoForm = z.infer<typeof processoSchema>;

/** Sanitiza: MAIÚSCULO e remove não-alfanumérico */
export const toUpperAlnum = (t: string) => t.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
