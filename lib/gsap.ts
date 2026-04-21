import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollSmoother } from "gsap/ScrollSmoother"
import { SplitText } from "gsap/SplitText"
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin"
import { Physics2DPlugin } from "gsap/Physics2DPlugin"
import { Flip } from "gsap/Flip"
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin"

// All Club plugins are free in the gsap npm package (v3.12+)
gsap.registerPlugin(
  useGSAP,
  ScrollTrigger,
  ScrollSmoother,
  SplitText,
  DrawSVGPlugin,
  Physics2DPlugin,
  Flip,
  ScrambleTextPlugin
)

export {
  gsap,
  useGSAP,
  ScrollTrigger,
  ScrollSmoother,
  SplitText,
  DrawSVGPlugin,
  Physics2DPlugin,
  Flip,
  ScrambleTextPlugin,
}
