import * as React from "react";
import { useMemo } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import {
  Border,
  Height,
  Color,
  FontSize,
  Width,
  Padding,
  Gap,
  FontFamily,
} from "../GlobalStyles";

export type DivType = {
  showImage?: boolean;
  sarahJenkins?: string;
  collegeStudent19y?: string;
  onTrack?: string;
  event1?: string;
  nextSessionTomorrow400PM?: string;

  /** Style props */
  divTop?: number | string;
  divBackgroundColor?: string;
  divWidth?: number | string;
  sarahJenkinsWidth?: number | string;
  collegeStudentWidth?: number | string;
  spanWidth?: number | string;
  spanBackgroundColor?: string;
  onTrackWidth?: number | string;
  onTrackColor?: string;
  nextSessionTomorrowWidth?: number | string;
};

const getStyleValue = (key: string, value: string | number | undefined) => {
  if (value === undefined) return;
  return { [key]: value === "unset" ? undefined : value };
};
const Div = ({
  showImage,
  divTop,
  divBackgroundColor,
  divWidth,
  sarahJenkins,
  sarahJenkinsWidth,
  collegeStudent19y,
  collegeStudentWidth,
  spanWidth,
  spanBackgroundColor,
  onTrack,
  onTrackWidth,
  onTrackColor,
  event1,
  nextSessionTomorrow400PM,
  nextSessionTomorrowWidth,
}: DivType) => {
  const divStyle = useMemo(() => {
    return {
      ...getStyleValue("top", divTop),
      ...getStyleValue("backgroundColor", divBackgroundColor),
    };
  }, [divTop, divBackgroundColor]);

  const div1Style = useMemo(() => {
    return {
      ...getStyleValue("width", divWidth),
    };
  }, [divWidth]);

  const sarahJenkinsStyle = useMemo(() => {
    return {
      ...getStyleValue("width", sarahJenkinsWidth),
    };
  }, [sarahJenkinsWidth]);

  const collegeStudentStyle = useMemo(() => {
    return {
      ...getStyleValue("width", collegeStudentWidth),
    };
  }, [collegeStudentWidth]);

  const spanStyle = useMemo(() => {
    return {
      ...getStyleValue("width", spanWidth),
      ...getStyleValue("backgroundColor", spanBackgroundColor),
    };
  }, [spanWidth, spanBackgroundColor]);

  const onTrackStyle = useMemo(() => {
    return {
      ...getStyleValue("width", onTrackWidth),
      ...getStyleValue("color", onTrackColor),
    };
  }, [onTrackWidth, onTrackColor]);

  const nextSessionTomorrowStyle = useMemo(() => {
    return {
      ...getStyleValue("width", nextSessionTomorrowWidth),
    };
  }, [nextSessionTomorrowWidth]);

  return (
    <View style={styles.div}>
      <View style={styles.div2}>
        <View style={styles.div3}>
          <View style={[styles.div4, styles.divLayout2]}>
            {!!showImage && <View style={styles.div4Layout} />}
          </View>
          <View style={[styles.div5, styles.divLayout2, divStyle]} />
        </View>
        <View style={styles.div6}>
          <View style={[styles.div7, styles.divLayout]}>
            <View style={[styles.div8, styles.divLayout, div1Style]}>
              <Text style={[styles.sarahJenkins, sarahJenkinsStyle]}>
                {sarahJenkins}
              </Text>
              <Text
                style={[
                  styles.collegeStudent,
                  styles.collegeStudentTypo,
                  collegeStudentStyle,
                ]}
              >
                {collegeStudent19y}
              </Text>
            </View>
            <View style={[styles.span, spanStyle]}>
              <Text style={[styles.onTrack, onTrackStyle]}>{onTrack}</Text>
            </View>
          </View>
          <View style={styles.div9}>
            <Text style={styles.event}>{event1}</Text>
            <Text
              style={[
                styles.nextSessionTomorrow,
                styles.collegeStudentTypo,
                nextSessionTomorrowStyle,
              ]}
            >
              {nextSessionTomorrow400PM}
            </Text>
          </View>
          <View style={[styles.div10, styles.divLayout1]}>
            <Pressable style={[styles.button, styles.buttonFlexBox]}>
              <Text style={[styles.message, styles.messageTypo]}>Message</Text>
              <Text style={[styles.chatBubble, styles.personTypo]}>
                chat_bubble
              </Text>
            </Pressable>
            <Pressable style={[styles.button2, styles.buttonFlexBox]}>
              <Text style={[styles.profile, styles.messageTypo]}>Profile</Text>
              <Text style={[styles.person, styles.personTypo]}>person</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  divLayout2: {
    borderRadius: Border.br_9999,
    overflow: "hidden",
  },
  divLayout: {
    height: Height.height_38,
    overflow: "hidden",
  },
  collegeStudentTypo: {
    color: Color.colorDimgray100,
    fontSize: FontSize.fs_12,
    height: Height.height_16,
    textAlign: "left",
  },
  divLayout1: {
    width: Width.width_231,
    flexDirection: "row",
  },
  buttonFlexBox: {
    paddingVertical: Padding.padding_8,
    paddingHorizontal: Padding.padding_12,
    gap: Gap.gap_6,
    alignItems: "center",
    borderRadius: Border.br_24,
    justifyContent: "center",
    flex: 1,
    flexDirection: "row",
    overflow: "hidden",
  },
  messageTypo: {
    textAlign: "center",
    fontSize: FontSize.fs_12,
    height: Height.height_16,
    fontFamily: FontFamily.manropeBold,
    fontWeight: "700",
  },
  personTypo: {
    width: Width.width_19,
    textAlign: "center",
    fontFamily: FontFamily.materialIconsRegular,
    height: Height.height_16,
    fontSize: FontSize.fs_16,
  },
  div: {
    width: Width.width_343,
    height: Height.height_144,
    borderRadius: Border.br_32,
    backgroundColor: Color.colorWhite,
    padding: Padding.padding_16,
    overflow: "hidden",
  },
  div2: {
    width: Width.width_311,
    gap: Gap.gap_16,
    flexDirection: "row",
    height: Height.height_112,
    overflow: "hidden",
  },
  div3: {
    width: Width.width_64,
    height: Height.height_112,
    overflow: "hidden",
  },
  div4: {
    backgroundColor: Color.colorGainsboro,
    zIndex: 0,
    height: Height.height_64,
    width: Width.width_64,
  },
  div4Layout: {
    height: Height.height_64,
    width: Width.width_64,
  },
  div5: {
    width: Width.width_18,
    height: Height.height_18,
    position: "absolute",
    top: 344,
    left: 79,
    backgroundColor: Color.colorMediumspringgreen,
    borderColor: Color.colorWhite,
    borderWidth: 2,
    zIndex: 1,
    borderStyle: "solid",
  },
  div6: {
    justifyContent: "center",
    flex: 1,
    gap: Gap.gap_16,
    height: Height.height_112,
    overflow: "hidden",
  },
  div7: {
    justifyContent: "space-between",
    gap: Gap.gap_20,
    width: Width.width_231,
    flexDirection: "row",
  },
  div8: {
    width: 123,
    gap: Gap.gap_2,
  },
  sarahJenkins: {
    width: 111,
    height: Height.height_22,
    textAlign: "left",
    fontFamily: FontFamily.manropeBold,
    fontWeight: "700",
    fontSize: FontSize.fs_16,
    color: Color.colorGray200,
  },
  collegeStudent: {
    width: 127,
    fontWeight: "500",
    fontFamily: FontFamily.manropeMedium,
  },
  span: {
    height: Height.height_23,
    width: 68,
    backgroundColor: Color.colorHoneydew,
    paddingHorizontal: Padding.padding_8,
    paddingVertical: Padding.padding_4,
    borderRadius: Border.br_24,
    overflow: "hidden",
  },
  onTrack: {
    width: Width.width_46,
    fontSize: FontSize.fs_10,
    color: Color.colorSeagreen,
    height: Height.height_14,
    textAlign: "left",
    fontFamily: FontFamily.manropeBold,
    fontWeight: "700",
  },
  div9: {
    gap: Gap.gap_6,
    alignItems: "center",
    height: Height.height_16,
    width: Width.width_231,
    flexDirection: "row",
    overflow: "hidden",
  },
  event: {
    width: Width.width_17,
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.materialIconsRegular,
    height: Height.height_14,
    color: Color.colorDimgray100,
    textAlign: "left",
  },
  nextSessionTomorrow: {
    width: 186,
    fontFamily: FontFamily.manropeRegular,
  },
  div10: {
    gap: Gap.gap_8,
    height: Height.height_34,
    overflow: "hidden",
  },
  button: {
    backgroundColor: Color.colorDeepskyblue,
    height: Height.height_34,
  },
  message: {
    width: Width.width_55,
    color: Color.colorWhite,
  },
  chatBubble: {
    color: Color.colorWhite,
  },
  button2: {
    height: Height.height_35,
    borderColor: Color.colorGainsboro,
    borderWidth: 1,
    borderStyle: "solid",
  },
  profile: {
    width: Width.width_42,
    color: Color.colorGray200,
  },
  person: {
    color: Color.colorGray200,
  },
});

export default Div;
