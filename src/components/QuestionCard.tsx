import React from "react";
import { View, Text, TouchableOpacity, ImageBackground } from "react-native";
import { common, colors, spacing } from "../lib/theme";

type Props = {
  question: string;
  options: string[];
  onSelect: (index: number) => void;
};

export default function QuestionCard({ question, options, onSelect }: Props) {
  return (
    <ImageBackground
      source={require("../../assets/images/question-card-bg.png")}
      style={[common.card, { width: "100%" }]}
      imageStyle={{ borderRadius: 16 }}
    >
      <Text style={[common.text, { marginBottom: spacing.md }]}>
        {question}
      </Text>
      {options.map((opt, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => onSelect(i)}
          style={[
            common.button,
            { backgroundColor: colors.primary, width: "100%" },
          ]}
        >
          <Text style={common.buttonText}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </ImageBackground>
  );
}
