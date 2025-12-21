import * as React from "react";
import { useState } from "react";
import { Text, StyleSheet, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import Div from "./Div";
import {
  Gap,
  Height,
  Width,
  Padding,
  FontSize,
  FontFamily,
  Color,
} from "../GlobalStyles";

const Main = () => {
  const [divOpen, setDivOpen] = useState(false);
  const [divValue, setDivValue] = useState();
  const [divItems] = useState([
    {
      showImage: true,
      divTop: 344,
      divBackgroundColor: "#22c55e",
      divWidth: 123,
      sarahJenkins: "Sarah Jenkins",
      sarahJenkinsWidth: 111,
      collegeStudent19y: "College Student • 19y",
      collegeStudentWidth: 127,
      spanWidth: 68,
      spanBackgroundColor: "#dcfce7",
      onTrack: "On Track",
      onTrackWidth: 46,
      onTrackColor: "#15803d",
      event1: "event",
      nextSessionTomorrow400PM: "Next session: Tomorrow, 4:00 PM",
      nextSessionTomorrowWidth: 186,
    },
    {
      showImage: true,
      divTop: 504,
      divBackgroundColor: "#f59e0b",
      divWidth: 97,
      sarahJenkins: "David Miller",
      sarahJenkinsWidth: 93,
      collegeStudent19y: "High School • 17y",
      collegeStudentWidth: 101,
      spanWidth: 66,
      spanBackgroundColor: "#fef3c7",
      onTrack: "Check-in",
      onTrackWidth: 47,
      onTrackColor: "#b45309",
      event1: "history",
      nextSessionTomorrow400PM: "Last seen: 3 days ago",
      nextSessionTomorrowWidth: 121,
    },
    {
      showImage: false,
      divTop: 664,
      divBackgroundColor: "",
      divWidth: 81,
      sarahJenkins: "Maya Ross",
      sarahJenkinsWidth: 85,
      collegeStudent19y: "Gap Year • 18y",
      collegeStudentWidth: 84,
      spanWidth: 40,
      spanBackgroundColor: "#dbeafe",
      onTrack: "New",
      onTrackWidth: 25,
      onTrackColor: "#1d4ed8",
      event1: "check_circle",
      nextSessionTomorrow400PM: "Goal: Career Planning",
      nextSessionTomorrowWidth: 123,
    },
    {
      showImage: false,
      divTop: 824,
      divBackgroundColor: "#d1d5db",
      divWidth: "",
      sarahJenkins: "James Liu",
      sarahJenkinsWidth: 79,
      collegeStudent19y: "College Student • 21y",
      collegeStudentWidth: 126,
      spanWidth: 56,
      spanBackgroundColor: "#f3f4f6",
      onTrack: "Paused",
      onTrackWidth: 39,
      onTrackColor: "#4b5563",
      event1: "history",
      nextSessionTomorrow400PM: "Last active: 2 weeks ago",
      nextSessionTomorrowWidth: 137,
    },
  ]);

  return (
    <View style={[styles.main, styles.mainCommon]}>
      <View style={[styles.div, styles.divFlexBox]}>
        <Text style={styles.showing4Active}>Showing 4 active mentees</Text>
        <View style={[styles.div2, styles.divFlexBox]}>
          <DropDownPicker
            style={[styles.dropdownpicker, styles.divdropDownContainer]}
            open={divOpen}
            setOpen={setDivOpen}
            value={divValue}
            setValue={setDivValue}
            placeholder="Sort by: Recent"
            items={[]}
            labelStyle={styles.divValue}
            placeholderStyle={styles.divValue}
            textStyle={styles.divText}
            dropdownContainerStyle={styles.divdropDownContent}
            zIndex={2000}
            zIndexInverse={0}
            dropDownDirection={"BOTTOM"}
          />
        </View>
      </View>
      <View style={[styles.div3, styles.mainCommon]}>
        {divItems.map((item, index) => (
          <Div
            key={index}
            showImage={item.showImage}
            divTop={item.divTop}
            divBackgroundColor={item.divBackgroundColor}
            divWidth={item.divWidth}
            sarahJenkins={item.sarahJenkins}
            sarahJenkinsWidth={item.sarahJenkinsWidth}
            collegeStudent19y={item.collegeStudent19y}
            collegeStudentWidth={item.collegeStudentWidth}
            spanWidth={item.spanWidth}
            spanBackgroundColor={item.spanBackgroundColor}
            onTrack={item.onTrack}
            onTrackWidth={item.onTrackWidth}
            onTrackColor={item.onTrackColor}
            event1={item.event1}
            nextSessionTomorrow400PM={item.nextSessionTomorrow400PM}
            nextSessionTomorrowWidth={item.nextSessionTomorrowWidth}
          />
        ))}
        <View style={styles.div4} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  divValue: {
    color: "#30bae8",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Manrope-Bold",
  },
  divText: {
    color: "#30bae8",
    fontSize: 18,
    fontFamily: "MaterialIcons-Regular",
  },
  divdropDownContainer: {
    minHeight: 20,
    height: 20,
    borderWidth: 0,
    borderColor: "",
  },
  divdropDownContent: {
    borderColor: "",
    borderWidth: 0,
  },
  mainCommon: {
    gap: Gap.gap_16,
    overflow: "hidden",
  },
  divFlexBox: {
    alignItems: "center",
    flexDirection: "row",
    height: Height.height_20,
    overflow: "hidden",
  },
  main: {
    width: Width.width_375,
    flex: 0.7934,
    paddingHorizontal: Padding.padding_16,
    paddingTop: Padding.padding_16,
    paddingBottom: 96,
  },
  div: {
    zIndex: 5000,
    justifyContent: "space-between",
    gap: Gap.gap_20,
    width: Width.width_343,
  },
  showing4Active: {
    height: Height.height_19,
    width: 175,
    fontSize: FontSize.fs_14,
    fontWeight: "500",
    fontFamily: FontFamily.manropeMedium,
    color: Color.colorDimgray100,
    textAlign: "left",
  },
  div2: {
    zIndex: 2000,
    width: 126,
  },
  dropdownpicker: {
    minHeight: 20,
    height: 20,
    borderWidth: 0,
    borderColor: "",
  },
  div3: {
    height: 680,
    width: Width.width_343,
  },
  div4: {
    height: Height.height_40,
    width: Width.width_343,
    overflow: "hidden",
  },
});

export default Main;
