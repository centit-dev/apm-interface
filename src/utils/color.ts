export function generateColorGradient(
  startColor: string,
  endColor: string,
  steps: number
): string[] {
  const colorGradient: string[] = []

  for (let i = 0; i <= steps; i++) {
    const factor = i / steps
    const interpolatedColor = interpolateColor(startColor, endColor, factor)

    colorGradient.push(interpolatedColor)
  }

  return colorGradient
}

export function generateRandomColors(numColors: number): string[] {
  const colors: string[] = []
  const hueStep = 360 / numColors

  for (let i = 0; i < numColors; i++) {
    // 随机选择饱和度和亮度
    const saturation = Math.random() * 100
    // 保持亮度在25%到75%之间
    const lightness = 25 + Math.random() * 50

    // 保证相邻的颜色在色相轮上有足够的距离
    const hue = i * hueStep

    colors.push(hslToHex(hue, saturation, lightness))
  }

  return colors
}

function hslToHex(h: number, s: number, l: number) {
  l /= 100
  const a = (s * Math.min(l, 1 - l)) / 100
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)

    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0')
  }

  return `#${f(0)}${f(8)}${f(4)}`
}

export function findHighestContrastColor(color: string) {
  // 将颜色值转换为RGB值
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)

  // 计算给定颜色的亮度
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b

  let highestContrastColor = ''
  let highestContrastDifference = -1

  // 遍历所有可能的颜色
  for (let i = 0; i <= 255; i++) {
    for (let j = 0; j <= 255; j++) {
      for (let k = 0; k <= 255; k++) {
        // 计算每个颜色的亮度
        const contrastLuminance = 0.299 * i + 0.587 * j + 0.114 * k

        // 计算亮度差异
        const contrastDifference = Math.abs(luminance - contrastLuminance)

        // 更新对比度最高的颜色
        if (contrastDifference > highestContrastDifference) {
          highestContrastDifference = contrastDifference
          highestContrastColor = `#${i.toString(16).padStart(2, '0')}${j
            .toString(16)
            .padStart(2, '0')}${k.toString(16).padStart(2, '0')}`
        }
      }
    }
  }

  return highestContrastColor
}

function interpolateColor(color1: string, color2: string, factor: number) {
  // 将颜色值转换为十进制数
  const r1 = parseInt(color1.slice(1, 3), 16)
  const g1 = parseInt(color1.slice(3, 5), 16)
  const b1 = parseInt(color1.slice(5, 7), 16)

  const r2 = parseInt(color2.slice(1, 3), 16)
  const g2 = parseInt(color2.slice(3, 5), 16)
  const b2 = parseInt(color2.slice(5, 7), 16)

  // 计算中间颜色的 RGB 值
  const r = Math.round(r1 + factor * (r2 - r1))
  const g = Math.round(g1 + factor * (g2 - g1))
  const b = Math.round(b1 + factor * (b2 - b1))

  // 将 RGB 值转换为十六进制颜色字符串
  const interpolatedColor = `#${r.toString(16).padStart(2, '0')}${g
    .toString(16)
    .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`

  return interpolatedColor
}
