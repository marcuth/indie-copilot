/** Lado (em px) das logos de projeto depois de processadas */
export const LOGO_SIZE = 256
/** Lado mínimo aceito, para evitar ampliar imagens pequenas demais */
export const LOGO_MIN_SIZE = 128
/** Tamanho máximo do arquivo enviado */
export const LOGO_MAX_FILE_BYTES = 5 * 1024 * 1024
export const LOGO_ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"]

const OUTPUT_TYPE = "image/webp"
const OUTPUT_QUALITY = 0.92

export class LogoError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "LogoError"
    }
}

function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file)
        const image = new Image()

        image.onload = () => {
            URL.revokeObjectURL(url)
            resolve(image)
        }
        image.onerror = () => {
            URL.revokeObjectURL(url)
            reject(new LogoError("Não foi possível ler essa imagem."))
        }
        image.src = url
    })
}

/**
 * Valida (apenas imagens quadradas) e redimensiona a logo para
 * LOGO_SIZE x LOGO_SIZE, devolvendo uma data URL pronta para salvar.
 */
export async function processLogo(file: File): Promise<string> {
    if (!LOGO_ACCEPTED_TYPES.includes(file.type)) {
        throw new LogoError("Formato não suportado. Use PNG, JPG ou WebP.")
    }

    if (file.size > LOGO_MAX_FILE_BYTES) {
        throw new LogoError("A imagem é muito grande. O limite é de 5 MB.")
    }

    const image = await loadImage(file)
    const { naturalWidth: width, naturalHeight: height } = image

    if (width !== height) {
        throw new LogoError(
            `A logo precisa ser quadrada. Essa imagem tem ${width}×${height} px.`,
        )
    }

    if (width < LOGO_MIN_SIZE) {
        throw new LogoError(
            `A logo é pequena demais (${width}×${height} px). O mínimo é ${LOGO_MIN_SIZE}×${LOGO_MIN_SIZE} px.`,
        )
    }

    const canvas = document.createElement("canvas")
    canvas.width = LOGO_SIZE
    canvas.height = LOGO_SIZE

    const context = canvas.getContext("2d")
    if (!context) {
        throw new LogoError("Não foi possível processar a imagem.")
    }

    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = "high"
    context.drawImage(image, 0, 0, LOGO_SIZE, LOGO_SIZE)

    return canvas.toDataURL(OUTPUT_TYPE, OUTPUT_QUALITY)
}
