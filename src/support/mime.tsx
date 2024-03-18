import { useEffect, useRef } from "react"
import { last, sortBy } from "lodash-es"
import languagedetection from "@vscode/vscode-languagedetection"

export const ops = new languagedetection.ModelOperations()

export const useMime = (str: string, minLength = 50): string | undefined => {
  const mime = useRef<string>()
  const n = useRef(0)

  const run = async () => {
    if (str.length >= minLength * n.current) {
      const m = await guessMime(str)
      n.current += 1
      if (m) mime.current = m
    }
  }

  useEffect(() => {
    run()
  }, [str])

  return mime.current
}

export async function guessMime(str: string, minConfidence = 0.05) {
  const result = await ops.runModel(str)
  return last(
    sortBy(
      result.filter((r) => r.confidence > minConfidence),
      (r) => r.confidence,
    ),
  )?.languageId
}
