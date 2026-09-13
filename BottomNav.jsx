import { NavLink } from "react-router-dom";
import {
  Home,
  Map,
  BellRing,
  Camera,
  Brain,
} from "lucide-react";

import { useLanguage } from "../context/LanguageContext";

function BottomNav() {
  const { t } = useLanguage();

  const items = [
    {
      name: t.dashboard,
      path: "/",
      icon: Home,
    },
    {
      name: t.riskMap,
      path: "/map",
      icon: Map,
    },
    {
      name: t.warning,
      path: "/early-warning",
      icon: BellRing,
    },
    {
      name: t.report,
      path: "/field-report",
      icon: Camera,
    },
    {
      name: t.aiEngine,
      path: "/predict",
      icon: Brain,
    },
  ];

  return (
    <nav className="bottom-navigation fixed bottom-0 left-0 right-0 z-[1000] border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl justify-around px-1 py-2">

        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative flex min-w-0 flex-1 flex-col items-center gap-1 py-1.5 transition ${
                  isActive
                    ? "text-cyan-400"
                    : "text-slate-500 hover:text-slate-300"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -top-2 h-1 w-7 rounded-full bg-cyan-400" />
                  )}

                  <Icon
                    size={21}
                    strokeWidth={isActive ? 2.5 : 2}
                  />

                  <span className="max-w-full truncate text-[9px] font-semibold">
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}

      </div>
    </nav>
  );
}

export default BottomNav;