import { type ReactNode } from "react"
import { Box, Text } from "ink"
import { capitalize } from "../support/util"
import { useTheme } from "../support/theming"
import color from "tinycolor2"

export type MessageProps = {
  role: string
  model?: string
  children: ReactNode
}

export const Message = ({ role, model, children }: MessageProps) => {
  const theme = useTheme()
  return (
    <Box padding={1} gap={1} flexDirection="column" width="100%">
      <Box gap={1} justifyContent="space-between">
        <Text bold color={color(theme.text).darken(5).toHexString()}>
          {capitalize(role)}:
        </Text>
        {role == "assistant" && <Text color={theme.muted}>{model}</Text>}
      </Box>
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={theme.muted}
        paddingX={2}
        paddingY={1}
      >
        {children}
      </Box>
    </Box>
  )
}
