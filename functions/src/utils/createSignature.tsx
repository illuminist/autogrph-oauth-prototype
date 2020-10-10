import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'
import SeedRandom from 'seed-random'

const createStyleOuter = (
  rand: () => number,
  l: number = 50,
): React.CSSProperties => {
  const h = Math.floor(rand() * 360)
  const padding = 8 * (Math.floor(rand() * 3) + 1)
  return {
    backgroundColor: `hsl(${h},${50}%,${l}%)`,
    borderRadius: 4 * Math.floor(rand() * 6),
    padding,
  }
}

const createStyleInner = (
  rand: () => number,
  l: number = 50,
): React.CSSProperties => {
  const h = Math.floor(rand() * 360)
  const padding = 8 * (Math.floor(rand() * 3) + 1)
  return {
    backgroundColor: `hsl(${h},${50}%,${l}%)`,
    borderRadius: 4 * Math.floor(rand() * 6),
    padding,
    color: l > 50 ? '#070707' : '#f7f7f7',
    textAlign: 'center',
    fontSize: `${rand() * 10 + 14}px`,
    fontStyle: rand() > 0.5 ? 'italic' : 'normal',
  }
}

const Signature = ({ rand, text }: { rand: () => number; text: string }) => {
  const outerL = rand() * 100
  const innerL = 50 + (rand() * (outerL > 50 ? -1 : 1) * 40 + 10)
  return (
    <div style={createStyleOuter(rand, outerL)}>
      <div style={createStyleInner(rand, innerL)}>
        {text.split('::').map((t) => (
          <p>{t}</p>
        ))}
      </div>
    </div>
  )
}

export const createSignature = (seed: string) => {
  const rand = SeedRandom(seed)
  return ReactDOMServer.renderToStaticMarkup(
    <Signature rand={rand} text={seed} />,
  )
}

export default createSignature
