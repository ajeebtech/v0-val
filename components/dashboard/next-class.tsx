'use client';

import { useEffect, useState } from 'react';
import GearIcon from '@/components/icons/gear';

interface ClassTime {
  time: string;
  class: string;
}

interface Timetable {
  [key: string]: ClassTime[];
}

const timetableData: Timetable = {
  "Monday": [
    {"time": "08:00-08:50", "class": "BECE204L AB3-307"},
    {"time": "08:55-09:45", "class": "BCSE303L AB3-307"},
    {"time": "09:50-10:40", "class": "BMAT205L AB3-209"},
    {"time": "10:45-11:35", "class": "BCSE202L AB3-607"},
    {"time": "11:40-12:30", "class": "BCSE103E AB3-305"},
    {"time": "15:50-16:40", "class": "BCSE103E AB1-605A"},
    {"time": "16:45-17:35", "class": "BCSE103E AB1-605A"}
  ],
  "Tuesday": [
    {"time": "08:00-08:50", "class": "BCSE202L AB3-607"},
    {"time": "08:55-09:45", "class": "BJAP101L AB3-207"},
    {"time": "09:50-10:40", "class": "BCSE205L AB3-303"},
    {"time": "10:45-11:35", "class": "BSTS202P AB3-308"},
    {"time": "15:50-16:40", "class": "BCSE202P AB1-311"},
    {"time": "16:45-17:35", "class": "BCSE202P AB1-311"}
  ],
  "Wednesday": [
    {"time": "08:00-08:50", "class": "BSTS202P AB3-308"},
    {"time": "08:55-09:45", "class": "BECE204L AB3-307"},
    {"time": "09:50-10:40", "class": "BCSE303L AB3-307"},
    {"time": "10:45-11:35", "class": "BMAT205L AB3-209"},
    {"time": "15:50-16:40", "class": "BCSE103E AB1-605A"},
    {"time": "16:45-17:35", "class": "BCSE103E AB1-605A"}
  ],
  "Thursday": [
    {"time": "08:00-08:50", "class": "BMAT205L AB3-209"},
    {"time": "08:55-09:45", "class": "BCSE202L AB3-607"},
    {"time": "09:50-10:40", "class": "BJAP101L AB3-207"},
    {"time": "10:45-11:35", "class": "BCSE205L AB3-303"},
    {"time": "15:50-16:40", "class": "BECE204P AB3-602"},
    {"time": "14:55-15:45", "class": "BECE204P AB3-602"},
    {"time": "15:50-16:40", "class": "BCSE303P AB1-311"},
    {"time": "16:45-17:35", "class": "BCSE303P AB1-311"}
  ],
  "Friday": [
    {"time": "08:00-08:50", "class": "BCSE205L AB3-303"},
    {"time": "08:55-09:45", "class": "BSTS202P AB3-308"},
    {"time": "09:50-10:40", "class": "BECE204L AB3-307"},
    {"time": "10:45-11:35", "class": "BCSE303L AB3-307"},
    {"time": "11:40-12:30", "class": "BMAT205L AB3-209"}
  ],
  "Saturday": [
    {"time": "09:50-10:40", "class": "BEEE102L AB3-605"},
    {"time": "10:45-11:35", "class": "BEEE102L AB3-605"},
    {"time": "15:50-16:40", "class": "BEEE102L AB3-605"}
  ],
  "Sunday": [
    {"time": "08:00-08:50", "class": "BEEE102L AB3-605"},
    {"time": "08:55-09:45", "class": "BEEE102L AB3-605"},
    {"time": "14:00-14:50", "class": "BEEE102L AB3-605"}
  ]
};

interface ClassInfo {
  time: string;
  className: string;
  room: string;
  isCurrentClass: boolean;
  timeDisplay: string;
  isTomorrow?: boolean;
}

export default function NextClass() {
  const [nextClass, setNextClass] = useState<ClassInfo | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      updateNextClass();
    }, 60000);

    // Initial update
    updateNextClass();

    return () => clearInterval(timer);
  }, []);

  const updateNextClass = () => {
    try {
      const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = dayOfWeek[currentTime.getDay()];
      const todayClasses = timetableData[today] || [];
      
      // Get current time in minutes since midnight for comparison
      const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
      
      // Find the next class
      for (const classItem of todayClasses) {
        const [startTime, endTime] = classItem.time.split('-');
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        
        const classStartMinutes = startHour * 60 + startMinute;
        const classEndMinutes = endHour * 60 + endMinute;
        
        // If current time is before class ends, show this class
        if (currentMinutes < classEndMinutes) {
          const [className, room] = classItem.class.split(' ');
          setNextClass({
            time: classItem.time,
            className,
            room,
            isCurrentClass: currentMinutes >= classStartMinutes,
            timeDisplay: classItem.time,
            isTomorrow: false
          });
          return;
        }
      }
      
      // If no more classes today, find first class tomorrow
      const tomorrowIndex = (currentTime.getDay() + 1) % 7;
      const tomorrow = dayOfWeek[tomorrowIndex];
      const tomorrowClasses = timetableData[tomorrow] || [];
      
      if (tomorrowClasses.length > 0) {
        const firstClass = tomorrowClasses[0];
        const [className, room] = firstClass.class.split(' ');
        setNextClass({
          time: firstClass.time,
          className,
          room,
          isCurrentClass: false,
          timeDisplay: firstClass.time,
          isTomorrow: true
        });
      } else {
        setNextClass(null);
      }
    } catch (err) {
      console.error('Error updating next class:', err);
      setNextClass(null);
    }
  };

  return (
    <div className="p-5 bg-black rounded-xl border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400">NEXT CLASS</h3>
        <GearIcon className="w-5 h-5 text-gray-500 hover:text-gray-300 transition-colors" />
      </div>
      
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-gray-700 transition-colors">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-white font-medium">{nextClass?.className || 'No classes found'}</p>
            <p className="text-sm text-gray-400">{nextClass?.room || 'Check back later'}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white font-mono">
              {nextClass?.time || '--:--'}
            </p>
            {nextClass?.isCurrentClass ? (
              <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-medium bg-blue-900 text-blue-200">
                In Progress
              </span>
            ) : nextClass?.isTomorrow ? (
              <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-medium bg-purple-900 text-purple-200">
                Tomorrow
              </span>
            ) : nextClass ? (
              <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-medium bg-green-900 text-green-200">
                Up Next
              </span>
            ) : null}
          </div>
        </div>
      </div>
      
    </div>
  );
}
