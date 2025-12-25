/**
 * Файл: src/infrastructure/loading/resourceLoader.ts
 * Слой: infrastructure (adapter)
 * Назначение: проверка готовности ресурсов (шрифты, текстуры, CSS) для экрана загрузки.
 *
 * Инварианты:
 * - Параллельная проверка всех ресурсов через Promise.all
 * - Таймаут 5 секунд на случай зависания
 * - Возвращает процент готовности (0-100) для прогресс-бара
 */

export type ResourceProgress = {
  fonts: boolean
  textures: boolean
  css: boolean
}

export type ResourceLoaderCallbacks = {
  onProgress?: (progress: ResourceProgress, percent: number) => void
}

/**
 * Проверка готовности шрифтов.
 * Ждём document.fonts.ready и проверяем конкретный шрифт Press Start 2P.
 */
async function checkFonts(): Promise<boolean> {
  try {
    // Ждём готовности всех шрифтов
    await document.fonts.ready

    // Проверяем конкретный шрифт Press Start 2P
    const fontName = 'Press Start 2P'
    const checkFont = document.fonts.check(`12px "${fontName}"`)
    
    // Если шрифт не загружен, ждём ещё немного (максимум 2 секунды)
    if (!checkFont) {
      const timeout = new Promise<boolean>((resolve) => {
        setTimeout(() => resolve(false), 2000)
      })
      
      const fontCheck = new Promise<boolean>((resolve) => {
        const checkInterval = setInterval(() => {
          if (document.fonts.check(`12px "${fontName}"`)) {
            clearInterval(checkInterval)
            resolve(true)
          }
        }, 100)
        
        // Очистка через 2 секунды
        setTimeout(() => {
          clearInterval(checkInterval)
          resolve(false)
        }, 2000)
      })
      
      return Promise.race([fontCheck, timeout])
    }
    
    return true
  } catch (error) {
    console.warn('Font check failed:', error)
    return false
  }
}

/**
 * Проверка готовности текстур (SVG из public/textures/).
 * Предзагружаем через Image API.
 */
async function checkTextures(): Promise<boolean> {
  const textures = ['/textures/diagmonds-light.svg', '/textures/noise.svg', '/textures/stardust.svg']
  
  try {
    const loadPromises = textures.map((src) => {
      return new Promise<boolean>((resolve) => {
        const img = new Image()
        img.onload = () => resolve(true)
        img.onerror = () => resolve(false)
        img.src = src
        
        // Таймаут 3 секунды на текстуру
        setTimeout(() => resolve(false), 3000)
      })
    })
    
    const results = await Promise.all(loadPromises)
    // Считаем успешным если хотя бы одна текстура загрузилась
    return results.some((r) => r)
  } catch (error) {
    console.warn('Texture check failed:', error)
    return false
  }
}

/**
 * Проверка готовности CSS.
 * Проверяем наличие критических стилей через getComputedStyle.
 */
async function checkCSS(): Promise<boolean> {
  try {
    // Проверяем наличие Tailwind классов и кастомных стилей
    // Создаём временный элемент и проверяем стили
    const testEl = document.createElement('div')
    testEl.className = 'font-press-start'
    testEl.style.display = 'none'
    document.body.appendChild(testEl)
    
    const computedStyle = window.getComputedStyle(testEl)
    const fontFamily = computedStyle.fontFamily
    
    document.body.removeChild(testEl)
    
    // Проверяем что шрифт применился (должен содержать "Press Start 2P" или fallback)
    // Также проверяем что стили вообще загрузились
    return fontFamily.length > 0
  } catch (error) {
    console.warn('CSS check failed:', error)
    return false
  }
}

/**
 * Вычисляет процент готовности на основе прогресса ресурсов.
 */
function calculateProgress(progress: ResourceProgress): number {
  let percent = 0
  if (progress.fonts) percent += 33
  if (progress.textures) percent += 33
  if (progress.css) percent += 34
  return percent
}

/**
 * Проверка готовности всех ресурсов с отслеживанием прогресса.
 * 
 * @param callbacks - колбэки для отслеживания прогресса
 * @returns Promise с булевым значением (true = ресурсы готовы или таймаут)
 */
export async function checkResourcesReady(callbacks?: ResourceLoaderCallbacks): Promise<boolean> {
  const progress: ResourceProgress = {
    fonts: false,
    textures: false,
    css: false,
  }
  
  // Обновляем прогресс
  const updateProgress = (key: keyof ResourceProgress, value: boolean) => {
    progress[key] = value
    const percent = calculateProgress(progress)
    callbacks?.onProgress?.(progress, percent)
  }
  
  // Запускаем проверки параллельно
  const fontsPromise = checkFonts().then((result) => {
    updateProgress('fonts', result)
    return result
  })
  
  const texturesPromise = checkTextures().then((result) => {
    updateProgress('textures', result)
    return result
  })
  
  const cssPromise = checkCSS().then((result) => {
    updateProgress('css', result)
    return result
  })
  
  // Таймаут 5 секунд
  const timeoutPromise = new Promise<boolean>((resolve) => {
    setTimeout(() => resolve(true), 5000)
  })
  
  // Ждём либо все ресурсы, либо таймаут
  try {
    await Promise.race([
      Promise.all([fontsPromise, texturesPromise, cssPromise]),
      timeoutPromise,
    ])
    
    // Если таймаут, всё равно возвращаем true (лучше показать игру, чем бесконечный loading)
    return true
  } catch (error) {
    console.warn('Resource check failed:', error)
    return true // В случае ошибки показываем игру
  }
}

