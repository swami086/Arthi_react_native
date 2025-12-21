import * as React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Width } from "../GlobalStyles";

const Frame1 = () => {
  return (
    <ScrollView
      style={styles.bookingSelectDate27PreviParent}
      contentContainerStyle={styles.frameScrollViewContent}
    >
      <Image
        style={styles.bookingSelectDate27Previ}
        contentFit="cover"
        source={require("../assets/Booking-Select-Date-27-Preview-Image.png")}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  frameScrollViewContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    flex: 1,
  },
  bookingSelectDate27PreviParent: {
    flex: 1,
    width: "100%",
    padding: 10,
    maxWidth: "100%",
  },
  bookingSelectDate27Previ: {
    height: 998,
    width: Width.width_375,
    borderRadius: 8,
  },
});

export default Frame1;
