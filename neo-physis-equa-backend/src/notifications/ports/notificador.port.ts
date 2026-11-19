export interface AvisoDTO {
  titulo: string;
  cuerpo: string;
  datos: Record<string, string>;
}

export interface Notificador {
  avisar(usuarioId: string, aviso: AvisoDTO): Promise<void>;
}

export const NOTIFICADOR_PORT = Symbol('NOTIFICADOR_PORT');
