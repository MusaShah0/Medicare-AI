import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars

// Pakistan bounding box (from Wikimedia location map)
const PK_NORTH = 37.3;
const PK_SOUTH = 23.4;
const PK_WEST = 60.5;
const PK_EAST = 80.5;
const PK_LAT_RANGE = PK_NORTH - PK_SOUTH;
const PK_LNG_RANGE = PK_EAST - PK_WEST;

// Use 800 as base width, calculate proportional height
const VIEW_W = 800;
const VIEW_H = Math.round(VIEW_W * (PK_LAT_RANGE / PK_LNG_RANGE));

function projectPoint(lat, lng) {
  const x = ((lng - PK_WEST) / PK_LNG_RANGE) * VIEW_W;
  const y = ((PK_NORTH - lat) / PK_LAT_RANGE) * VIEW_H;
  return { x, y };
}

function createCurvedPath(start, end) {
  const midX = (start.x + end.x) / 2;
  const midY = Math.min(start.y, end.y) - 40;
  return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
}

export function WorldMap({
  dots = [],
  lineColor = "#00B4A0",
  showLabels = true,
  animationDuration = 2,
  loop = true,
  mapImage = "/content/pakistan-map.svg",
}) {
  const svgRef = useRef(null);
  const [hoveredLocation, setHoveredLocation] = useState(null);

  const staggerDelay = 0.3;
  const totalAnimationTime = dots.length * staggerDelay + animationDuration;
  const pauseTime = 2;
  const fullCycleDuration = totalAnimationTime + pauseTime;

  return (
    <div className="w-full aspect-square md:aspect-[1.35/1] rounded-lg relative font-sans overflow-hidden bg-[#0B2D4D]">
      <img
        src={mapImage}
        className="h-full w-full pointer-events-none select-none object-cover absolute inset-0 opacity-80 brightness-150 saturate-200"
        alt="Pakistan map"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/60 via-transparent to-[#0A2540]/20 pointer-events-none" />
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full h-full absolute inset-0 pointer-events-auto select-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feMorphology operator="dilate" radius="0.5" />
            <feGaussianBlur stdDeviation="1" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          const startTime = (i * staggerDelay) / fullCycleDuration;
          const endTime = (i * staggerDelay + animationDuration) / fullCycleDuration;
          const resetTime = totalAnimationTime / fullCycleDuration;

          return (
            <g key={`path-group-${i}`}>
              <motion.path
                d={createCurvedPath(startPoint, endPoint)}
                fill="none"
                stroke="url(#path-gradient)"
                strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                animate={loop ? { pathLength: [0, 0, 1, 1, 0] } : { pathLength: 1 }}
                transition={
                  loop
                    ? {
                        duration: fullCycleDuration,
                        times: [0, startTime, endTime, resetTime, 1],
                        ease: "easeInOut",
                        repeat: Infinity,
                      }
                    : {
                        duration: animationDuration,
                        delay: i * staggerDelay,
                        ease: "easeInOut",
                      }
                }
              />
              {loop && (
                <motion.circle
                  r="5"
                  fill={lineColor}
                  initial={{ offsetDistance: "0%", opacity: 0 }}
                  animate={{
                    offsetDistance: [null, "0%", "100%", "100%", "100%"],
                    opacity: [0, 0, 1, 0, 0],
                  }}
                  transition={{
                    duration: fullCycleDuration,
                    times: [0, startTime, endTime, resetTime, 1],
                    ease: "easeInOut",
                    repeat: Infinity,
                  }}
                  style={{
                    offsetPath: `path('${createCurvedPath(startPoint, endPoint)}')`,
                  }}
                />
              )}
            </g>
          );
        })}

        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);

          return (
            <g key={`points-group-${i}`}>
              <g key={`start-${i}`}>
                <motion.g
                  onHoverStart={() => setHoveredLocation(dot.start.label || `Location ${i}`)}
                  onHoverEnd={() => setHoveredLocation(null)}
                  className="cursor-pointer"
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <circle cx={startPoint.x} cy={startPoint.y} r="4" fill={lineColor} filter="url(#glow)" />
                  <circle cx={startPoint.x} cy={startPoint.y} r="4" fill={lineColor} opacity="0.5">
                    <animate attributeName="r" from="4" to="14" dur="2s" begin="0s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.6" to="0" dur="2s" begin="0s" repeatCount="indefinite" />
                  </circle>
                </motion.g>
                {showLabels && dot.start.label && (
                  <motion.g
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 * i + 0.3, duration: 0.5 }}
                    className="pointer-events-none"
                  >
                    <foreignObject
                      x={startPoint.x - 55}
                      y={startPoint.y - 40}
                      width="110"
                      height="32"
                    >
                      <div className="flex items-center justify-center h-full">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#0A2540]/90 text-white border border-white/15 shadow-lg backdrop-blur-sm whitespace-nowrap">
                          {dot.start.label}
                        </span>
                      </div>
                    </foreignObject>
                  </motion.g>
                )}
              </g>

              <g key={`end-${i}`}>
                <motion.g
                  onHoverStart={() => setHoveredLocation(dot.end.label || `Destination ${i}`)}
                  onHoverEnd={() => setHoveredLocation(null)}
                  className="cursor-pointer"
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <circle cx={endPoint.x} cy={endPoint.y} r="4" fill={lineColor} filter="url(#glow)" />
                  <circle cx={endPoint.x} cy={endPoint.y} r="4" fill={lineColor} opacity="0.5">
                    <animate attributeName="r" from="4" to="14" dur="2s" begin="0.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.6" to="0" dur="2s" begin="0.5s" repeatCount="indefinite" />
                  </circle>
                </motion.g>
                {showLabels && dot.end.label && (
                  <motion.g
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 * i + 0.5, duration: 0.5 }}
                    className="pointer-events-none"
                  >
                    <foreignObject
                      x={endPoint.x - 55}
                      y={endPoint.y - 40}
                      width="110"
                      height="32"
                    >
                      <div className="flex items-center justify-center h-full">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#0A2540]/90 text-white border border-white/15 shadow-lg backdrop-blur-sm whitespace-nowrap">
                          {dot.end.label}
                        </span>
                      </div>
                    </foreignObject>
                  </motion.g>
                )}
              </g>
            </g>
          );
        })}
      </svg>

      <AnimatePresence>
        {hoveredLocation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-4 bg-[#0A2540]/90 text-white px-3 py-2 rounded-lg text-sm font-medium backdrop-blur-sm sm:hidden border border-white/20"
          >
            {hoveredLocation}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
