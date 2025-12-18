// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "wand.and.stars": "auto-fix-high",
  "photo.fill": "photo-library",
  "sparkles": "auto-awesome",
  "person.fill": "person",
  "gearshape.fill": "settings",
  "plus.circle.fill": "add-circle",
  "play.fill": "play-arrow",
  "pause.fill": "pause",
  "square.and.arrow.up": "share",
  "trash.fill": "delete",
  "heart.fill": "favorite",
  "heart": "favorite-border",
  "bookmark.fill": "bookmark",
  "bookmark": "bookmark-border",
  "magnifyingglass": "search",
  "bell.fill": "notifications",
  "checkmark.circle.fill": "check-circle",
  "xmark.circle.fill": "cancel",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
