import * as React from "react";
import { Text, StyleSheet, View, TextInput, Pressable } from "react-native";
import {
  Color,
  Padding,
  Width,
  Height,
  Border,
  FontFamily,
  FontSize,
  Gap,
} from "../GlobalStyles";

const Header = () => {
  return (
    <View style={styles.header}>
      <View style={styles.div}>
        <View style={styles.button}>
          <Text style={[styles.arrowBack, styles.arrowBackFlexBox]}>
            arrow_back
          </Text>
        </View>
        <Text style={[styles.myMentees, styles.arrowBackFlexBox]}>
          My Mentees
        </Text>
      </View>
      <View style={[styles.div2, styles.divLayout]}>
        <TextInput
          style={styles.div3}
          placeholder="search"
          multiline={false}
          placeholderTextColor="#4f626b"
        />
      </View>
      <View style={[styles.div4, styles.divLayout]}>
        <Pressable style={styles.button2}>
          <Text style={styles.allMentees}>All Mentees</Text>
        </Pressable>
        <Pressable style={[styles.button3, styles.buttonBorder]}>
          <Text style={[styles.active, styles.activeTypo]}>Active</Text>
        </Pressable>
        <Pressable style={[styles.button4, styles.buttonBorder]}>
          <Text style={[styles.pending, styles.activeTypo]}>Pending</Text>
        </Pressable>
        <View style={[styles.button5, styles.buttonBorder]}>
          <Text style={[styles.completed, styles.activeTypo]}>Completed</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  arrowBackFlexBox: {
    textAlign: "center",
    color: Color.colorGray200,
  },
  divLayout: {
    paddingHorizontal: Padding.padding_16,
    height: 54,
    overflow: "hidden",
    width: Width.width_375,
  },
  buttonBorder: {
    borderWidth: 1,
    borderColor: Color.colorGainsboro,
    backgroundColor: Color.colorWhite,
    height: Height.height_39,
    paddingVertical: Padding.padding_8,
    paddingHorizontal: Padding.padding_16,
    borderRadius: Border.br_9999,
    alignItems: "center",
    flexDirection: "row",
    overflow: "hidden",
    borderStyle: "solid",
  },
  activeTypo: {
    color: Color.colorDimgray100,
    fontFamily: FontFamily.manropeMedium,
    fontWeight: "500",
    fontSize: FontSize.fs_14,
    height: Height.height_19,
    textAlign: "center",
  },
  header: {
    height: 182,
    backgroundColor: Color.colorGray100,
    borderColor: Color.colorWhitesmoke,
    borderBottomWidth: 1,
    overflow: "hidden",
    borderStyle: "solid",
    width: Width.width_375,
  },
  div: {
    height: Height.height_72,
    justifyContent: "space-between",
    padding: Padding.padding_16,
    gap: 0,
    alignItems: "center",
    flexDirection: "row",
    overflow: "hidden",
    width: Width.width_375,
  },
  button: {
    height: Height.height_40,
    width: Width.width_40,
    justifyContent: "center",
    borderRadius: Border.br_9999,
    alignItems: "center",
    flexDirection: "row",
    overflow: "hidden",
  },
  arrowBack: {
    height: Height.height_24,
    width: Width.width_27,
    fontSize: FontSize.fs_24,
    fontFamily: FontFamily.materialIconsRegular,
  },
  myMentees: {
    height: 25,
    flex: 1,
    fontSize: FontSize.fs_18,
    fontWeight: "700",
    fontFamily: FontFamily.manropeBold,
  },
  div2: {
    paddingBottom: Padding.padding_12,
  },
  div3: {
    width: Width.width_343,
    height: 42,
    fontSize: FontSize.fs_20,
    fontFamily: FontFamily.materialIconsRegular,
    overflow: "hidden",
  },
  div4: {
    paddingBottom: Padding.padding_16,
    gap: Gap.gap_8,
    flexDirection: "row",
    paddingHorizontal: Padding.padding_16,
    height: 54,
  },
  button2: {
    height: Height.height_38,
    width: 110,
    backgroundColor: Color.colorDeepskyblue,
    paddingVertical: Padding.padding_8,
    paddingHorizontal: Padding.padding_16,
    borderRadius: Border.br_9999,
    alignItems: "center",
    flexDirection: "row",
    overflow: "hidden",
  },
  allMentees: {
    width: 81,
    fontWeight: "600",
    fontFamily: FontFamily.manropeSemiBold,
    color: Color.colorWhite,
    fontSize: FontSize.fs_14,
    height: Height.height_19,
    textAlign: "center",
  },
  button3: {
    width: 76,
  },
  active: {
    width: 45,
  },
  button4: {
    width: 89,
  },
  pending: {
    width: 57,
  },
  button5: {
    width: 108,
  },
  completed: {
    width: 76,
  },
});

export default Header;
