import * as React from "react";
import { ScrollView, Text, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Header from "../components/Header";
import Main from "../components/Main";
import {
  Width,
  FontFamily,
  Color,
  FontSize,
  Height,
  Padding,
  Gap,
} from "../GlobalStyles";

const BookingSelectDate11 = () => {
  return (
    <KeyboardAwareScrollView
      style={styles.bookingSelectDate11}
      contentContainerStyle={styles.bookingSelectDate11Content}
    >
      <View style={[styles.div, styles.divLayout]}>
        <Header />
        <Main />
        <View style={[styles.div2, styles.divLayout]}>
          <View style={styles.navContainer}>
            <View style={styles.button}>
              <Text style={styles.home}>home</Text>
              <Text style={[styles.home2, styles.home2Typo]}>Home</Text>
            </View>
            <View style={styles.button}>
              <Text style={styles.home}>calendar_month</Text>
              <Text style={[styles.sessions, styles.menteesLayout]}>
                Sessions
              </Text>
            </View>
          </View>
          <View style={styles.navContainer}>
            <View style={styles.button}>
              <Text style={[styles.diversity3, styles.menteesClr]}>
                diversity_3
              </Text>
              <Text style={[styles.mentees, styles.menteesClr]}>Mentees</Text>
            </View>
            <View style={styles.button}>
              <Text style={styles.home}>person</Text>
              <Text style={[styles.profile, styles.home2Typo]}>Profile</Text>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  bookingSelectDate11Content: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    minHeight: 812,
    flex: 1,
  },
  divLayout: {
    width: Width.width_375,
    overflow: "hidden",
  },
  home2Typo: {
    fontFamily: FontFamily.manropeMedium,
    fontWeight: "500",
    textAlign: "center",
    color: Color.colorDimgray100,
  },
  menteesLayout: {
    width: Width.width_46,
    fontSize: FontSize.fs_10,
    height: Height.height_14,
  },
  menteesClr: {
    color: Color.colorDeepskyblue,
    textAlign: "center",
  },
  bookingSelectDate11: {
    width: "100%",
    maxWidth: "100%",
    flex: 1,
    backgroundColor: Color.colorGray100,
  },
  div: {
    height: 1077,
    overflow: "hidden",
    backgroundColor: Color.colorGray100,
  },
  div2: {
    backgroundColor: Color.colorWhite,
    borderStyle: "solid",
    borderColor: Color.colorWhitesmoke,
    borderTopWidth: 1,
    flexDirection: "row",
    paddingHorizontal: Padding.padding_8,
    paddingTop: 11,
    paddingBottom: Padding.padding_12,
    gap: 89,
    overflow: "hidden",
    flex: 1,
  },
  navContainer: {
    height: 424,
    width: 90,
  },
  button: {
    alignItems: "center",
    gap: Gap.gap_4,
    width: 90,
    overflow: "hidden",
    flex: 1,
  },
  home: {
    width: Width.width_27,
    textAlign: "center",
    color: Color.colorDimgray100,
    fontFamily: FontFamily.materialIconsRegular,
    fontSize: FontSize.fs_24,
    height: Height.height_24,
  },
  home2: {
    width: 31,
    fontSize: FontSize.fs_10,
    height: Height.height_14,
    fontWeight: "500",
  },
  sessions: {
    fontFamily: FontFamily.manropeMedium,
    fontWeight: "500",
    textAlign: "center",
    color: Color.colorDimgray100,
  },
  diversity3: {
    width: 267,
    fontFamily: FontFamily.materialIconsRegular,
    fontSize: FontSize.fs_24,
    height: Height.height_24,
    color: Color.colorDeepskyblue,
  },
  mentees: {
    fontWeight: "700",
    fontFamily: FontFamily.manropeBold,
    width: Width.width_46,
    fontSize: FontSize.fs_10,
    height: Height.height_14,
  },
  profile: {
    width: 34,
    fontSize: FontSize.fs_10,
    height: Height.height_14,
    fontWeight: "500",
  },
});

export default BookingSelectDate11;
