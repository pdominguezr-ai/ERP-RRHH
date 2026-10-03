import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/config/database';
import { z } from 'zod';

const SolicitudCreateSchema = z.object({
  empleado_id: z.string().uuid('ID de empleado no válido'),
  tipo: z.enum(['VACACIONES', 'PERMISO', 'ENFERMEDAD', 'OTRO']),
  fecha_inicio: z.string().min(10, 'Fecha de inicio requerida'),
  fecha_fin: z.string().min(10, 'Fecha de fin requerida'),
  motivo: z.string().min(3, 'El motivo debe tener al menos 3 caracteres'),
});

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabase.from('solicitudes_ausencia').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ success: true, data: data || [] }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = SolicitudCreateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', details: parseResult.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('solicitudes_ausencia')
      .insert([{ ...parseResult.data, estado: 'PENDIENTE' }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, message: 'Solicitud enviada exitosamente', data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
  }
}
