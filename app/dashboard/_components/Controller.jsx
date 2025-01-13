import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Style from '@/app/_data/Style'
import Themes from "@/app/_data/Themes";
import GradientBg from "@/app/_data/GradientBg";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";



function Controller({ selectedTheme , selectedBackground ,selectedStyle,setSignInEnable}) {
    const [showMore,setShowMore] = useState(6)
  return (
    <div>
      {/* Theme Selection Controller */}
      <h2>Select Theme</h2>
      <Select onValueChange={(value) => selectedTheme(value)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Theme" />
        </SelectTrigger>
        <SelectContent>
          {Themes.map((theme, index) => (
            <SelectItem key={index} value={theme.theme}>
              <div className="flex items-center gap-3">
                {/* Color Indicators */}
                <div className="flex gap-1">
                  <div
                    className="h-5 w-5 rounded-l-md"
                    style={{ backgroundColor: theme.primary }}
                  />
                  <div
                    className="h-5 w-5"
                    style={{ backgroundColor: theme.secondary }}
                  />
                  <div
                    className="h-5 w-5"
                    style={{ backgroundColor: theme.accent }}
                  />
                  <div
                    className="h-5 w-5 rounded-r-md"
                    style={{ backgroundColor: theme.neutral }}
                  />
                </div>
                {/* Theme Name */}
                <span>{theme.theme}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Background Selection Controller */}
      <h2 className="mt-8 my-1">Background</h2>
      <div className="grid grid-cols-3 gap-4">
        {GradientBg.map((bg, index) => (index<showMore)&&(
          <div
            key={index}
            onClick={()=>selectedBackground(bg.gradient)}
            className="cursor-pointer w-full h-[70px] rounded-lg hover:border-black hover:border-2 flex items-center justify-center"
            style={{ background: bg.gradient }}
            
          >{index==0&&'None'}</div>
        ))}
        
      </div>
      <Button variant="ghost" className="w-full my-1" onClick={()=>setShowMore(showMore>6?6:20)}>
        {showMore>6?'Show Less':'Show More'}</Button>

        <div>
  <label>Style</label>
  <div className="grid grid-cols-3 gap-3">
    {Style.map((item, index) => (
      <div key={index}>
        <div className="cursor-pointer hover:border-2 rounded-lg" onClick={() => selectedStyle(item)}>
          {/* Make sure item.img corresponds to the correct image file name */}
          <img src={`/${item.name}.png`} width={600} height={80} className="rounded-lg" />
        </div>
        <h2 className="text-center">{item.name}</h2>
      </div>
    ))}
  </div>
</div>
<div className="flex gap-2 my-4 items-center mt-10">
  <Checkbox onCheckedChange={(e)=>setSignInEnable(e)}/> <h2>Enable Social Authentication before submission</h2>
</div>

    </div>
  );
}

export default Controller;
