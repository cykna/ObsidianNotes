"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  DEFAULT_SETTINGS: () => DEFAULT_SETTINGS,
  default: () => LiveWallpaperPlugin2
});
module.exports = __toCommonJS(main_exports);
var import_obsidian6 = require("obsidian");

// src/Settings/SettingsManager.ts
var import_obsidian5 = require("obsidian");

// src/Settings/Settings.ts
var import_obsidian2 = require("obsidian");

// src/Settings/SettingsUtils.ts
var import_obsidian = require("obsidian");

// src/Scheduler.ts
var Scheduler = class {
  static applyScheduledWallpaper(Wallpapers, options) {
    const now = /* @__PURE__ */ new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    if (!Wallpapers || Wallpapers.length === 0 || !options) {
      return null;
    }
    if (options.dayNightMode && options.dayStartTime && options.nightStartTime) {
      const [dayHour, dayMinute] = options.dayStartTime.split(":").map(Number);
      const [nightHour, nightMinute] = options.nightStartTime.split(":").map(Number);
      const dayTime = dayHour * 60 + dayMinute;
      const nightTime = nightHour * 60 + nightMinute;
      const isDay = dayTime < nightTime ? currentTime >= dayTime && currentTime < nightTime : currentTime >= dayTime || currentTime < nightTime;
      const index = isDay ? 0 : 1;
      if (Wallpapers[index]) return index;
    }
    if (options.weekly) {
      let day = now.getDay();
      day = (day + 6) % 7;
      if (Wallpapers[day]) return day;
    }
    if (options.shuffle) {
      const randomIndex = Math.floor(Math.random() * Wallpapers.length);
      return randomIndex;
    }
    return null;
  }
  static ValidateText(text) {
    const timePattern = /^(?:[01]?\d|2[0-3])(?::[0-5]\d){1,2}$/;
    return timePattern.test(text);
  }
  static Check(options, exceptKey) {
    const BOOLEAN_KEYS = [
      "dayNightMode",
      "weekly",
      "shuffle"
    ];
    return BOOLEAN_KEYS.some((k) => {
      if (k === exceptKey) return false;
      const val = options[k];
      return val === true || val === "true";
    });
  }
  static getIntervalInMs(options) {
    const timeStr = options.intervalCheckTime ?? "00:10";
    const [hh, mm] = timeStr.split(":").map(Number);
    return (hh * 60 + mm) * 60 * 1e3;
  }
};

// src/Settings/SettingsUtils.ts
async function getWallpaperPath(plugin, anyOptionEnabled) {
  const settings = plugin.settings;
  let path = "";
  if (!anyOptionEnabled) {
    path = `${plugin.app.vault.configDir}/${settings.wallpaperPath}`;
  } else {
    const isWeek = settings.scheduledWallpapers.options.weekly;
    const paths = isWeek ? settings.scheduledWallpapers.wallpaperWeekPaths : settings.scheduledWallpapers.wallpaperDayPaths;
    const index = Scheduler.applyScheduledWallpaper(
      paths,
      settings.scheduledWallpapers.options
    );
    if (index !== null) {
      const selectedPath = paths[index];
      path = `${plugin.app.vault.configDir}/${selectedPath}`;
      settings.wallpaperPath = selectedPath;
      await plugin.saveSettings();
    } else {
      new import_obsidian.Notice("No wallpaper path set.");
      settings.wallpaperPath = "";
      await plugin.saveSettings();
      return "";
    }
  }
  return path;
}
async function getPathExists(plugin, relativePath) {
  if (!relativePath || relativePath.trim() === "") {
    return false;
  }
  const fullPath = `${plugin.app.vault.configDir}/${relativePath}`;
  return await wallpaperExists(plugin, fullPath);
}
async function wallpaperExists(plugin, path) {
  return await plugin.app.vault.adapter.exists(path);
}
function applyImagePosition(element, posXPercent, posYPercent) {
  const container = element.parentElement;
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  const naturalWidth = element instanceof HTMLImageElement ? element.naturalWidth : element.videoWidth;
  const naturalHeight = element instanceof HTMLImageElement ? element.naturalHeight : element.videoHeight;
  const scale = Math.max(containerWidth / naturalWidth, containerHeight / naturalHeight);
  const scaledWidth = naturalWidth * scale;
  const scaledHeight = naturalHeight * scale;
  const maxOffsetX = (scaledWidth - containerWidth) / 2;
  const maxOffsetY = (scaledHeight - containerHeight) / 2;
  const offsetX = (posXPercent - 50) / 50 * maxOffsetX;
  const offsetY = (posYPercent - 50) / 50 * maxOffsetY;
  element.style.width = `${scaledWidth}px`;
  element.style.height = `${scaledHeight}px`;
  element.style.objectFit = "cover";
  element.style.position = "absolute";
  element.style.left = `${containerWidth / 2 - scaledWidth / 2 + offsetX}px`;
  element.style.top = `${containerHeight / 2 - scaledHeight / 2 + offsetY}px`;
}

// src/Settings/Settings.ts
var positions = /* @__PURE__ */ new Map([
  ["right", "Right"],
  ["left", "Left"],
  ["center", "Center"]
]);
var SettingsApp = class extends import_obsidian2.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    const anyOptionEnabled = Scheduler.Check(this.plugin.settings.scheduledWallpapers.options);
    const setting = new import_obsidian2.Setting(containerEl).setName("Wallpaper source").setDesc("Select an image, GIF, or video file to use as your wallpaper");
    if (!anyOptionEnabled) {
      setting.addButton(async (btn) => {
        const pathExists = await getPathExists(
          this.plugin,
          this.plugin.settings.wallpaperPath
        );
        if (pathExists) {
          btn.setIcon("circle-check").setTooltip("Wallpaper path exists");
        } else {
          btn.setIcon("circle-x").setTooltip("Wallpaper path is missing");
        }
      });
      setting.addButton(
        (btn) => btn.setButtonText("History").setIcon("history").setClass("mod-cta").onClick(async () => {
          containerEl.empty();
          await this.plugin.cleanInvalidWallpaperHistory();
          this.plugin.settings.HistoryPaths.forEach((entry) => {
            new import_obsidian2.Setting(containerEl).setName(entry.fileName).setDesc(entry.path).addButton((button) => {
              button.setButtonText("Select").onClick(async () => {
                const pluginId = this.plugin.manifest.id;
                const baseDir = `${this.app.vault.configDir}/plugins/${pluginId}/wallpapers`;
                const sourceFullPath = `${this.app.vault.configDir}/${entry.path}`;
                const targetFullPath = `${baseDir}/active/normal/${entry.fileName}`;
                const exists = await this.app.vault.adapter.exists(targetFullPath);
                if (!exists) {
                  try {
                    await this.app.vault.adapter.copy(sourceFullPath, targetFullPath);
                  } catch (e) {
                    console.error("Failed to copy wallpaper from history to active/normal", e);
                    return;
                  }
                }
                const relativeTargetFullPath = targetFullPath.replace(`${this.app.vault.configDir}/`, "");
                const folder = relativeTargetFullPath.substring(0, relativeTargetFullPath.lastIndexOf("/"));
                await this.plugin.removeAllExcept(folder, relativeTargetFullPath);
                this.plugin.settings.wallpaperPath = `plugins/${pluginId}/wallpapers/active/normal/${entry.fileName}`;
                this.plugin.settings.wallpaperType = entry.type;
                this.plugin.applyWallpaper(false);
                this.display();
              });
            });
          });
        })
      );
    }
    setting.addButton((btn) => {
      btn.setButtonText("Check wallpaper").setIcon("image-file").onClick(async () => {
        const path = await getWallpaperPath(this.plugin, anyOptionEnabled);
        if (!path) {
          new import_obsidian2.Notice("No wallpaper path set.");
          return;
        }
        if (await wallpaperExists(this.plugin, path)) {
          new import_obsidian2.Notice("Wallpaper loaded successfully.");
        } else {
          new import_obsidian2.Notice("Wallpaper file not found. Resetting path.");
          this.plugin.settings.wallpaperPath = "";
          await this.plugin.saveSettings();
        }
      });
    });
    if (!anyOptionEnabled) {
      setting.addButton(
        (btn) => btn.setButtonText("Browse").setIcon("folder-open").setClass("mod-cta").onClick(() => this.plugin.openFilePicker())
      );
    }
    new import_obsidian2.Setting(containerEl).setName("Use full-resolution wallpapers").setDesc("Keeps the original image size. To apply, add the wallpaper again.").addToggle((Toggle) => {
      Toggle.setValue(this.plugin.settings.Quality).onChange(async (value) => {
        this.plugin.settings.Quality = value;
        await this.plugin.saveSettings();
      });
    });
    if (this.plugin.settings.INBUILD) {
      this.plugin.registerDomEvent(window, "resize", () => {
        if (!this.plugin.settings.INBUILD) return;
        const media = document.getElementById("live-wallpaper-media");
        applyImagePosition(
          media,
          this.plugin.settings.PositionX ?? 50,
          this.plugin.settings.PositionY ?? 50
        );
      });
      new import_obsidian2.Setting(containerEl).setName("Horizontal position").setDesc("Adjust the horizontal position of the wallpaper.").addSlider((slider) => {
        slider.setLimits(0, 50, 1).setValue(this.plugin.settings.PositionX ?? 50).onChange(async (value) => {
          const media = document.getElementById("live-wallpaper-media");
          this.plugin.settings.PositionX = value;
          await this.plugin.saveSettings();
          if (media) {
            applyImagePosition(
              media,
              this.plugin.settings.PositionX,
              this.plugin.settings.PositionY ?? 50
            );
          }
        });
      });
      new import_obsidian2.Setting(containerEl).setName("Vertical position").setDesc("Adjust the vertical position of the wallpaper.").addSlider((slider) => {
        slider.setLimits(0, 100, 1).setValue(this.plugin.settings.PositionY ?? 50).onChange(async (value) => {
          const media = document.getElementById("live-wallpaper-media");
          this.plugin.settings.PositionY = value;
          await this.plugin.saveSettings();
          if (media) {
            applyImagePosition(
              media,
              this.plugin.settings.PositionX ?? 50,
              this.plugin.settings.PositionY
            );
          }
        });
      });
      new import_obsidian2.Setting(containerEl).setName("Image position").setDesc("Adjust the image alignment when the main focus is off-center.").addDropdown((dropdown) => {
        positions.forEach((label, key) => {
          dropdown.addOption(key, label);
        });
        dropdown.setValue(this.plugin.settings.Position).onChange(async (value) => {
          const media = document.getElementById("live-wallpaper-media");
          this.plugin.settings.Position = value;
          await this.plugin.saveSettings();
          if (media) {
            this.plugin.applyMediaStyles(media);
          }
        });
      });
      new import_obsidian2.Setting(containerEl).setName("Disable image cover").setDesc("Toggle this option to turn off object-fit: cover for the image.").addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.useObjectFit).onChange(async (value) => {
          const media = document.getElementById("live-wallpaper-media");
          this.plugin.settings.useObjectFit = value;
          await this.plugin.saveSettings();
          if (media) {
            this.plugin.applyMediaStyles(media);
          }
        });
      });
    }
    new import_obsidian2.Setting(containerEl).setName("Wallpaper opacity").setDesc(
      "Controls the transparency level of the wallpaper (0% = fully transparent, 100% = fully visible)"
    ).addSlider((slider) => {
      const valueEl = containerEl.createEl("span", {
        text: ` ${this.plugin.settings.opacity}%`,
        cls: "setting-item-description"
      });
      const initialValue = this.plugin.settings.AdnvOpend ? 100 : this.plugin.settings.opacity;
      if (this.plugin.settings.AdnvOpend) {
        slider.setDisabled(true);
        valueEl.textContent = ` 100%`;
      }
      slider.setLimits(0, 80, 1).setValue(initialValue).setDisabled(this.plugin.settings.AdnvOpend).setDynamicTooltip().setInstant(true).onChange(async (v) => {
        if (!this.plugin.settings.AdnvOpend) {
          this.plugin.settings.opacity = v;
          valueEl.textContent = ` ${v}%`;
          await this.plugin.saveSettings();
          this.plugin.applyWallpaper(anyOptionEnabled);
        }
      });
    });
    new import_obsidian2.Setting(containerEl).setName("Blur radius").setDesc("Applies a blur effect to the wallpaper in pixels").addSlider((slider) => {
      const valueEl = containerEl.createEl("span", {
        text: ` ${this.plugin.settings.blurRadius}px`,
        cls: "setting-item-description"
      });
      slider.setInstant(true).setLimits(0, 20, 1).setValue(this.plugin.settings.blurRadius).onChange(async (v) => {
        this.plugin.settings.blurRadius = v;
        valueEl.textContent = ` ${v}px`;
        await this.plugin.saveSettings();
        this.plugin.applyWallpaper(anyOptionEnabled);
      });
    });
    new import_obsidian2.Setting(containerEl).setName("Brightness").setDesc("Adjusts the wallpaper brightness (100% = normal)").addSlider((slider) => {
      const valueEl = containerEl.createEl("span", {
        text: ` ${this.plugin.settings.brightness}%`,
        cls: "setting-item-description"
      });
      slider.setInstant(true).setLimits(20, 130, 1).setValue(this.plugin.settings.brightness).onChange(async (v) => {
        this.plugin.settings.brightness = v;
        valueEl.textContent = ` ${v}%`;
        await this.plugin.saveSettings();
        this.plugin.applyWallpaper(anyOptionEnabled);
      });
    });
    new import_obsidian2.Setting(containerEl).setName("Layer position (z\u2011index)").setDesc(
      "Determines the stacking order: higher values bring the wallpaper closer to the front"
    ).addSlider((slider) => {
      const valueEl = containerEl.createEl("span", {
        text: ` ${this.plugin.settings.zIndex}`,
        cls: "setting-item-description"
      });
      if (this.plugin.settings.AdnvOpend) {
        this.plugin.settings.zIndex = 0;
        valueEl.textContent = ` 0`;
      }
      slider.setInstant(true).setLimits(-10, 100, 1).setValue(this.plugin.settings.zIndex).setDisabled(this.plugin.settings.AdnvOpend).onChange(async (v) => {
        if (!this.plugin.settings.AdnvOpend) {
          this.plugin.settings.zIndex = v;
          valueEl.textContent = ` ${v}`;
          await this.plugin.saveSettings();
          this.plugin.applyWallpaper(anyOptionEnabled);
        }
      });
    });
    if (this.plugin.settings.AdnvOpend) {
      this.plugin.settings.opacity = 100;
      this.plugin.settings.zIndex = 0;
      this.plugin.saveSettings().then(() => {
        this.plugin.applyWallpaper(anyOptionEnabled);
      });
    }
    new import_obsidian2.Setting(containerEl).setName("Change playback speed").setDesc(
      "Adjust the playback speed for videos (0.25x \u2013 2x). This does not affect GIFs."
    ).addSlider((slider) => {
      const valueEl = containerEl.createSpan({
        text: `${this.plugin.settings.playbackSpeed.toFixed(2)}x`,
        cls: "setting-item-description"
      });
      slider.setInstant(true).setLimits(0.25, 2, 0.25).setValue(this.plugin.settings.playbackSpeed).onChange(async (val) => {
        this.plugin.settings.playbackSpeed = val;
        await this.plugin.saveSettings();
        await this.plugin.applyWallpaper(false);
        valueEl.setText(`${val.toFixed(2)}x`);
      });
    });
    if (import_obsidian2.Platform.isMobileApp) {
      const desc = document.createElement("div");
      desc.textContent = "On mobile devices, zooming can affect background size. You can manually set the height and width to maintain consistency.";
      containerEl.appendChild(desc);
      new import_obsidian2.Setting(containerEl).setName("Background width").setDesc(
        "Set a custom width for the background on mobile (e.g., 100vw or 500px)."
      ).addText(
        (text) => text.setPlaceholder("e.g., 100vw").setValue(this.plugin.settings.mobileBackgroundWidth || "").onChange(async (value) => {
          this.plugin.settings.mobileBackgroundWidth = value;
          await this.plugin.saveSettings();
          this.plugin.ChangeWallpaperContainer();
        })
      );
      new import_obsidian2.Setting(containerEl).setName("Background height").setDesc(
        "Set a custom height for the background on mobile (e.g., 100vh or 800px)."
      ).addText(
        (text) => text.setPlaceholder("e.g., 100vh").setValue(this.plugin.settings.mobileBackgroundHeight || "").onChange(async (value) => {
          this.plugin.settings.mobileBackgroundHeight = value;
          await this.plugin.saveSettings();
          this.plugin.ChangeWallpaperContainer();
        })
      );
      new import_obsidian2.Setting(containerEl).setName("Match screen size").setDesc(
        "Automatically set the background size to match your device's screen dimensions."
      ).addButton(
        (button) => button.setButtonText("Resize to screen").onClick(async () => {
          this.plugin.settings.mobileBackgroundHeight = window.innerHeight.toString() + "px";
          this.plugin.settings.mobileBackgroundWidth = window.innerWidth.toString() + "px";
          this.plugin.ChangeWallpaperContainer();
          await this.plugin.saveSettings();
          this.display();
        })
      );
    }
    new import_obsidian2.Setting(containerEl).setName("Reset options").setDesc("Resets all settings").addButton(
      (Button) => Button.setButtonText("Reset").onClick(async () => {
        const defaults = DEFAULT_SETTINGS;
        this.plugin.settings.wallpaperPath = defaults.wallpaperPath;
        this.plugin.settings.wallpaperType = defaults.wallpaperType;
        this.plugin.settings.HistoryPaths = defaults.HistoryPaths;
        this.plugin.settings.playbackSpeed = defaults.playbackSpeed;
        this.plugin.settings.opacity = defaults.opacity;
        this.plugin.settings.zIndex = defaults.zIndex;
        this.plugin.settings.blurRadius = defaults.blurRadius;
        this.plugin.settings.brightness = defaults.brightness;
        this.plugin.settings.mobileBackgroundHeight = defaults.mobileBackgroundHeight;
        this.plugin.settings.mobileBackgroundWidth = defaults.mobileBackgroundWidth;
        await this.plugin.saveSettings();
        this.plugin.applyWallpaper(anyOptionEnabled);
        this.display();
      })
    );
    new import_obsidian2.Setting(containerEl).setName("Under construction").setDesc("Feature under construction (may be slightly buggy during testing).").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.INBUILD).onChange(async (value) => {
        const media = document.getElementById("live-wallpaper-media");
        this.plugin.settings.INBUILD = value;
        await this.plugin.saveSettings();
        this.display();
        this.plugin.applyMediaStyles(media);
        if (value === true) applyImagePosition(media, this.plugin.settings.PositionX ?? 50, this.plugin.settings.PositionY);
      })
    );
  }
};

// src/Settings/ScheduledWallpaperSettings.ts
var import_obsidian3 = require("obsidian");
var ScheduledApp = class extends import_obsidian3.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian3.Setting(containerEl).setName("Day and night mode").setDesc("Enable different wallpapers for day and night").addToggle(
      (toggle) => toggle.setValue(
        this.plugin.settings.scheduledWallpapers.options.dayNightMode
      ).onChange(async (value) => {
        const otherEnabled = Scheduler.Check(
          this.plugin.settings.scheduledWallpapers.options,
          "dayNightMode"
        );
        if (value && otherEnabled) {
          new import_obsidian3.Notice("Only one mode can be enabled at a time.");
          toggle.setValue(false);
          return;
        }
        this.plugin.settings.scheduledWallpapers.options.dayNightMode = value;
        await this.plugin.saveSettings();
        this.display();
        this.plugin.applyWallpaper(true);
      })
    );
    if (this.plugin.settings.scheduledWallpapers.options.dayNightMode) {
      const paths = this.plugin.settings.scheduledWallpapers.wallpaperDayPaths;
      if (!paths[0]) paths[0] = "";
      if (!paths[1]) paths[1] = "";
      new import_obsidian3.Setting(containerEl).setName("Day Wallpaper").setDesc("Wallpaper to use during the day").addButton(
        (btn) => btn.setIcon("folder-open").setTooltip("Browse for file").onClick(() => this.plugin.openFilePicker(0))
      );
      new import_obsidian3.Setting(containerEl).setName("Night Wallpaper").setDesc("Wallpaper to use at night").addButton(
        (btn) => btn.setIcon("folder-open").setTooltip("Browse for file").onClick(() => this.plugin.openFilePicker(1))
      );
      let dayTimeValue = this.plugin.settings.scheduledWallpapers.options.dayStartTime;
      let nightTimeValue = this.plugin.settings.scheduledWallpapers.options.nightStartTime;
      const Time = new import_obsidian3.Setting(containerEl).setName("Time").setDesc("Enter time in HH:MM format (e.g., 23:54)");
      Time.addText((area) => {
        area.setPlaceholder("HH:MM").setValue(
          this.plugin.settings.scheduledWallpapers.options.dayStartTime ?? ""
        ).onChange((value) => {
          dayTimeValue = value;
        });
      });
      Time.addText((area) => {
        area.setPlaceholder("HH:MM").setValue(
          this.plugin.settings.scheduledWallpapers.options.nightStartTime ?? ""
        ).onChange((value) => {
          nightTimeValue = value;
        });
      });
      new import_obsidian3.Setting(containerEl).addButton(
        (btn) => btn.setButtonText("Apply now").setCta().onClick(async () => {
          if (Scheduler.ValidateText(dayTimeValue) && Scheduler.ValidateText(nightTimeValue)) {
            this.plugin.settings.scheduledWallpapers.options.dayStartTime = dayTimeValue;
            this.plugin.settings.scheduledWallpapers.options.nightStartTime = nightTimeValue;
            await this.plugin.saveSettings();
            new import_obsidian3.Notice("Wallpaper schedule has been set.");
            this.plugin.applyWallpaper(true);
          } else {
            new import_obsidian3.Notice(
              "One or both time values are invalid. Use HH:MM format."
            );
          }
        })
      );
      new import_obsidian3.Setting(containerEl).setName("Check day and night wallpapers").setDesc(
        "Check whether the paths to the day and night wallpapers are set and whether the files exist."
      ).addButton(async (btn) => {
        btn.setButtonText("Check").onClick(async () => {
          const dayPath = this.plugin.settings.scheduledWallpapers.wallpaperDayPaths[0];
          const nightPath = this.plugin.settings.scheduledWallpapers.wallpaperDayPaths[1];
          const dayExists = dayPath ? await getPathExists(this.plugin, dayPath) : false;
          const nightExists = nightPath ? await getPathExists(this.plugin, nightPath) : false;
          if (dayExists && nightExists) {
            new import_obsidian3.Notice("Both wallpapers (day and night) are set and exist.");
          } else if (!dayExists && !nightExists) {
            new import_obsidian3.Notice("Both wallpapers are missing: day and night.");
          } else if (!dayExists) {
            new import_obsidian3.Notice("The day wallpaper is not set or does not exist.");
          } else {
            new import_obsidian3.Notice("The night wallpaper is not set or does not exist.");
          }
        });
      });
    }
    new import_obsidian3.Setting(containerEl).setName("Weekly mode").setDesc("Enable different wallpapers for any day").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.scheduledWallpapers.options.weekly).onChange(async (value) => {
        const otherEnabled = Scheduler.Check(
          this.plugin.settings.scheduledWallpapers.options,
          "weekly"
        );
        if (value && otherEnabled) {
          new import_obsidian3.Notice("Only one mode can be enabled at a time.");
          toggle.setValue(false);
          return;
        }
        this.plugin.settings.scheduledWallpapers.options.weekly = value;
        await this.plugin.saveSettings();
        this.display();
        this.plugin.applyWallpaper(true);
      })
    );
    if (this.plugin.settings.scheduledWallpapers.options.weekly) {
      const paths = this.plugin.settings.scheduledWallpapers.wallpaperWeekPaths;
      let selectedDay = "Monday";
      const daysOfWeek = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ];
      daysOfWeek.forEach((_, index) => {
        if (!paths[index]) {
          paths[index] = "";
        }
      });
      new import_obsidian3.Setting(containerEl).setName("Day Wallpaper").setDesc("Wallpaper to use during the day").addButton(
        (btn) => btn.setIcon("folder-open").setTooltip("Browse for file").onClick(() => {
          const index = daysOfWeek.indexOf(selectedDay);
          if (index !== -1) {
            this.plugin.openFilePicker(index);
          } else {
            console.warn("Invalid day selected");
          }
        })
      ).addDropdown((dropdown) => {
        daysOfWeek.forEach((day) => {
          dropdown.addOption(day, day);
        });
        dropdown.setValue(selectedDay);
        dropdown.onChange((value) => {
          selectedDay = value;
        });
      });
      new import_obsidian3.Setting(containerEl).setName("Check weekly wallpapers").setDesc(
        "Check if the paths for the weekly wallpapers are set and if the files exist."
      ).addButton((btn) => {
        btn.setButtonText("Check").onClick(async () => {
          const missingDays = [];
          for (let i = 0; i < paths.length; i++) {
            const pathExists = await getPathExists(this.plugin, paths[i]);
            if (!pathExists) {
              missingDays.push(daysOfWeek[i]);
            }
          }
          if (missingDays.length > 0) {
            new import_obsidian3.Notice(`Missing wallpapers for: ${missingDays.join(", ")}`);
          } else {
            new import_obsidian3.Notice("All weekly wallpapers are loaded.");
          }
        });
      });
    }
    const WALLPAPER_INTERVALS = {
      "00:01": "Every 1 minute",
      "00:05": "Every 5 minutes",
      "00:10": "Every 10 minutes",
      "00:30": "Every 30 minutes",
      "01:00": "Every 1 hour",
      "custom": "Custom interval"
    };
    const currentInterval = this.plugin.settings.scheduledWallpapers.options.intervalCheckTime ?? "00:10";
    new import_obsidian3.Setting(containerEl).setName("Wallpaper change interval").setDesc("How often the wallpaper should be checked and changed").addDropdown((dropdown) => {
      dropdown.addOptions(WALLPAPER_INTERVALS);
      dropdown.setValue(this.plugin.settings.scheduledWallpapers.options.isCustomInterval ? "custom" : currentInterval);
      dropdown.onChange(async (value) => {
        if (value !== "custom") {
          this.plugin.settings.scheduledWallpapers.options.intervalCheckTime = value;
          this.plugin.settings.scheduledWallpapers.options.isCustomInterval = false;
          await this.plugin.saveSettings();
          this.plugin.startDayNightWatcher();
          this.display();
        } else {
          this.plugin.settings.scheduledWallpapers.options.intervalCheckTime = "00:42";
          this.plugin.settings.scheduledWallpapers.options.isCustomInterval = true;
          await this.plugin.saveSettings();
          this.display();
        }
      });
    });
    if (this.plugin.settings.scheduledWallpapers.options.isCustomInterval) {
      let customValue = currentInterval;
      new import_obsidian3.Setting(containerEl).setName("Custom interval").setDesc("Enter time in HH:MM format (e.g., 00:42)").addText((text) => {
        text.setPlaceholder("HH:MM").setValue(currentInterval).onChange((value) => {
          customValue = value;
        });
      });
      new import_obsidian3.Setting(containerEl).addButton(
        (btn) => btn.setButtonText("Apply custom interval").setCta().onClick(async () => {
          if (!Scheduler.ValidateText(customValue)) {
            new import_obsidian3.Notice("Invalid format. Use HH:MM.");
            return;
          }
          this.plugin.settings.scheduledWallpapers.options.intervalCheckTime = customValue;
          await this.plugin.saveSettings();
          this.plugin.startDayNightWatcher();
          new import_obsidian3.Notice("Custom interval applied.");
        })
      );
    }
  }
};

// src/Settings/AdvnSettings.ts
var import_obsidian4 = require("obsidian");
var LiveWallpaperSettingTab = class extends import_obsidian4.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    const advancedSection = containerEl.createDiv();
    const anyOptionEnabled = Scheduler.Check(this.plugin.settings.scheduledWallpapers.options);
    new import_obsidian4.Setting(advancedSection).setName("Experimental options").setHeading();
    new import_obsidian4.Setting(advancedSection).setName(
      "fine-tune advanced transparency settings to seamlessly integrate your wallpaper. these experimental features allow for deeper customization but may require css knowledge."
    );
    const toggleAdvancedButton = advancedSection.createEl("button", {
      text: this.plugin.settings.AdnvOpend ? "Disable experimental settings" : "Enable experimental settings"
    });
    const advancedOptionsContainer = advancedSection.createDiv();
    advancedOptionsContainer.style.display = this.plugin.settings.AdnvOpend ? "block" : "none";
    toggleAdvancedButton.onclick = () => {
      this.plugin.settings.AdnvOpend = !this.plugin.settings.AdnvOpend;
      advancedOptionsContainer.style.display = this.plugin.settings.AdnvOpend ? "block" : "none";
      toggleAdvancedButton.setText(
        this.plugin.settings.AdnvOpend ? "Hide advanced options" : "Show advanced options"
      );
      this.plugin.toggleModalStyles();
      this.plugin.settings.opacity = 40;
      this.plugin.settings.zIndex = 5;
      this.plugin.applyWallpaper(anyOptionEnabled);
      this.plugin.saveSettings();
      this.display();
    };
    const tableDescription = advancedOptionsContainer.createEl("p", {
      cls: "advanced-options-description"
    });
    tableDescription.innerHTML = "Define UI elements and CSS attributes that should be made transparent. This allows the wallpaper to appear behind the interface, improving readability and aesthetic. Each row lets you specify a target element (CSS selector) and the attribute you want to override.<br><br>Example targets and attributes you can modify:<br>\u2022 target: <code>.theme-dark</code>, attribute: <code>--background-primary</code><br>\u2022 target: <code>.theme-dark</code>, attribute: <code>--background-secondary</code><br>\u2022 target: <code>.theme-dark</code>, attribute: <code>--background-secondary-alt</code><br>\u2022 target: <code>.theme-dark</code>, attribute: <code>--col-pr-background</code><br>\u2022 target: <code>.theme-dark</code>, attribute: <code>--col-bckg-mainpanels</code><br>\u2022 target: <code>.theme-dark</code>, attribute: <code>--col-txt-titlebars</code><br><br>You can inspect elements and variables using browser dev tools (CTRL + SHIFT + I) to discover more attributes to adjust.";
    const tableContainer = advancedOptionsContainer.createEl("div", {
      cls: "text-arena-table-container"
    });
    const table = tableContainer.createEl("table", { cls: "text-arena-table" });
    const thead = table.createEl("thead");
    const headerRow = thead.createEl("tr");
    headerRow.createEl("th", { text: "Target element (CSS selector)" });
    headerRow.createEl("th", { text: "Attribute to modify" });
    const tbody = table.createEl("tbody");
    this.plugin.settings.TextArenas.forEach((entry, index) => {
      const row = tbody.createEl("tr");
      const targetCell = row.createEl("td");
      new import_obsidian4.Setting(targetCell).addText((text) => {
        text.setValue(entry.target).onChange((value) => {
          this.plugin.settings.TextArenas[index].target = value;
          this.plugin.saveSettings();
        });
      });
      const attrCell = row.createEl("td");
      new import_obsidian4.Setting(attrCell).addText((text) => {
        text.setValue(entry.attribute).onChange((value) => {
          this.plugin.RemoveChanges(index);
          this.plugin.settings.TextArenas[index].attribute = value;
          this.plugin.saveSettings();
          this.plugin.ApplyChanges(index);
        });
      });
      const actionCell = row.createEl("td");
      new import_obsidian4.Setting(actionCell).addExtraButton((btn) => {
        btn.setIcon("cross").setTooltip("Remove this entry").onClick(() => {
          this.plugin.RemoveChanges(index);
          this.plugin.settings.TextArenas.splice(index, 1);
          this.plugin.saveSettings();
          this.display();
        });
      });
    });
    new import_obsidian4.Setting(advancedOptionsContainer).addButton(
      (btn) => btn.setButtonText("Add new element").setClass("text-arena-center-button").setTooltip("Add a new row to the table").onClick(() => {
        this.plugin.settings.TextArenas.push({ target: "", attribute: "" });
        this.display();
      })
    );
    let colorPickerRef = null;
    const colorSetting = new import_obsidian4.Setting(advancedOptionsContainer).setName("Custom background color").setDesc("Set a custom color for the plugin's styling logic").addColorPicker((picker) => {
      colorPickerRef = picker;
      picker.setValue(this.plugin.settings.Color || "#000000").onChange(async (value) => {
        this.plugin.settings.Color = value;
        await this.plugin.saveSettings();
        this.plugin.applyBackgroundColor();
      });
    }).addExtraButton(
      (btn) => btn.setIcon("reset").setTooltip("Reset to default").onClick(async () => {
        this.plugin.settings.Color = "";
        await this.plugin.saveSettings();
        this.plugin.applyBackgroundColor();
        if (colorPickerRef) {
          colorPickerRef.setValue("#000000");
        }
      })
    );
  }
};

// src/Settings/SettingsManager.ts
var LiveWallpaperSettingManager = class extends import_obsidian5.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.regularTab = new SettingsApp(app, plugin);
    this.scheduledTab = new ScheduledApp(app, plugin);
    this.advancedTab = new LiveWallpaperSettingTab(app, plugin);
    this.activeTab = "regular";
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    const navContainer = containerEl.createDiv({
      cls: "live-wallpaper-settings-nav"
    });
    new import_obsidian5.Setting(navContainer).addButton((button) => {
      button.setButtonText("General settings").setClass(this.activeTab === "regular" ? "mod-cta" : "mod-off").onClick(() => {
        this.activeTab = "regular";
        this.display();
      });
    }).addButton((button) => {
      button.setButtonText("Scheduled themes").setClass(this.activeTab === "dynamic" ? "mod-cta" : "mod-off").onClick(() => {
        this.activeTab = "dynamic";
        this.display();
      });
    }).addButton((button) => {
      button.setButtonText("Advanced settings").setClass(this.activeTab === "advanced" ? "mod-cta" : "mod-off").onClick(() => {
        this.activeTab = "advanced";
        this.display();
      });
    });
    const contentContainer = containerEl.createDiv({
      cls: "live-wallpaper-settings-content"
    });
    if (this.activeTab === "regular") {
      this.regularTab.containerEl = contentContainer;
      this.regularTab.display();
    } else if (this.activeTab === "advanced") {
      this.advancedTab.containerEl = contentContainer;
      this.advancedTab.display();
    } else {
      this.scheduledTab.containerEl = contentContainer;
      this.scheduledTab.display();
    }
  }
};

// src/main.ts
var DEFAULT_SETTINGS = {
  wallpaperPath: "",
  wallpaperType: "image",
  playbackSpeed: 1,
  Quality: false,
  opacity: 40,
  zIndex: 5,
  blurRadius: 8,
  brightness: 100,
  HistoryPaths: [],
  mobileBackgroundWidth: "100vw",
  mobileBackgroundHeight: "100vh",
  AdnvOpend: false,
  TextArenas: [
    { target: "", attribute: "" }
  ],
  Color: "#000000",
  Position: "Center",
  PositionX: 50,
  PositionY: 50,
  useObjectFit: true,
  INBUILD: false,
  scheduledWallpapers: {
    wallpaperDayPaths: [],
    wallpaperWeekPaths: [],
    options: {
      dayNightMode: false,
      weekly: false,
      shuffle: false,
      dayStartTime: "08:00",
      nightStartTime: "20:00",
      intervalCheckTime: "00:10",
      isCustomInterval: false
    },
    wallpaperDayTypes: [],
    wallpaperWeekTypes: []
  }
};
var LiveWallpaperPlugin2 = class extends import_obsidian6.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    this.lastPath = null;
    this.lastType = null;
  }
  async onload() {
    await this.loadSettings();
    await this.ensureWallpaperFolderExists();
    if (!this.settings.migrated) {
      await this.migrateOldSettings();
      this.settings.migrated = true;
      await this.saveSettings();
    }
    const anyOptionEnabled = Scheduler.Check(this.settings.scheduledWallpapers.options);
    this.toggleModalStyles();
    this.addSettingTab(new LiveWallpaperSettingManager(this.app, this));
    this.ChangeWallpaperContainer();
    this.removeExistingWallpaperElements();
    const newContainer = this.createWallpaperContainer();
    const appContainer = document.querySelector(".app-container");
    if (appContainer) appContainer.insertAdjacentElement("beforebegin", newContainer);
    else document.body.appendChild(newContainer);
    document.body.classList.add("live-wallpaper-active");
    if (anyOptionEnabled) {
      this.startDayNightWatcher();
      this.applyWallpaper(true);
    } else {
      this.applyWallpaper(false);
    }
    this.registerEvent(
      this.app.workspace.on("css-change", () => {
        const el = document.getElementById("live-wallpaper-container");
        if (el) this.applyWallpaper(anyOptionEnabled);
      })
    );
    await this.applyBackgroundColor();
  }
  async unload() {
    await this.clearBackgroundColor();
    this.removeExistingWallpaperElements();
    this.RemoveModalStyles();
    this.stopDayNightWatcher();
    document.body.classList.remove("live-wallpaper-active");
    await this.LoadOrUnloadChanges(false);
    await super.unload();
  }
  async loadSettings() {
    try {
      const loaded = await this.loadData();
      this.settings = { ...DEFAULT_SETTINGS, ...loaded };
      await this.LoadOrUnloadChanges(true);
    } catch (e) {
      console.error("Live Wallpaper Plugin \u2013 loadSettings error:", e);
      this.settings = { ...DEFAULT_SETTINGS };
    }
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  async migrateOldSettings() {
    const scheduled = this.settings.scheduledWallpapers;
    if (Array.isArray(scheduled.wallpaperPaths)) {
      const oldPaths = scheduled.wallpaperPaths;
      scheduled.wallpaperDayPaths = [oldPaths[0] ?? "", oldPaths[1] ?? ""];
      scheduled.wallpaperWeekPaths = oldPaths.slice(2, 9);
      delete scheduled.wallpaperPaths;
    }
    if (Array.isArray(scheduled.wallpaperTypes)) {
      const oldTypes = scheduled.wallpaperTypes;
      scheduled.wallpaperDayTypes = [
        this.isValidWallpaperType(oldTypes[0]) ? oldTypes[0] : "image",
        this.isValidWallpaperType(oldTypes[1]) ? oldTypes[1] : "image"
      ];
      scheduled.wallpaperWeekTypes = oldTypes.slice(2, 9).map((t) => t ?? "image");
      delete scheduled.wallpaperTypes;
    }
    const pluginDir = `${this.app.vault.configDir}/plugins/${this.manifest.id}`;
    const oldDir = `${pluginDir}/wallpaper`;
    const exists = await this.app.vault.adapter.exists(oldDir);
    if (exists) {
      const oldFolder = `${this.app.vault.configDir}/plugins/${this.manifest.id}/wallpaper`;
      try {
        await this.app.vault.adapter.rmdir(oldFolder, true);
      } catch (err) {
        console.error("Could not remove old wallpaper folder:", err);
      }
    }
  }
  isValidWallpaperType(t) {
    return ["image", "video", "gif"].includes(t);
  }
  async applyWallpaper(anyOptionEnabled) {
    let newPath = null;
    let newType = this.settings.wallpaperType;
    if (anyOptionEnabled) {
      const { paths, types } = this.getCurrentWallpaperSet();
      const index = Scheduler.applyScheduledWallpaper(paths, this.settings.scheduledWallpapers.options);
      if (index !== null) {
        newPath = paths[index];
        newType = types[index];
        this.settings.wallpaperPath = newPath;
        this.settings.wallpaperType = newType;
        this.startDayNightWatcher();
      } else {
        this.lastPath = this.lastType = null;
        return;
      }
    } else if (!this.settings.wallpaperPath) {
      this.lastPath = this.lastType = null;
      return;
    } else {
      newPath = this.settings.wallpaperPath;
      newType = this.settings.wallpaperType;
    }
    const container = document.getElementById("live-wallpaper-container");
    let media = document.getElementById("live-wallpaper-media");
    if (container && media) {
      Object.assign(container.style, {
        opacity: `${this.settings.opacity / 100}`,
        zIndex: `${this.settings.zIndex}`,
        filter: `blur(${this.settings.blurRadius}px) brightness(${this.settings.brightness}%)`
      });
      if (media instanceof HTMLVideoElement) {
        media.playbackRate = this.settings.playbackSpeed;
      }
      if (newPath !== this.lastPath || newType !== this.lastType) {
        const newMedia2 = await this.createMediaElement();
        if (newMedia2) {
          newMedia2.style.opacity = "0";
          newMedia2.style.transition = "opacity 1s ease-in-out";
          container.appendChild(newMedia2);
          requestAnimationFrame(() => {
            newMedia2.style.opacity = "1";
          });
          const medias = container.querySelectorAll('[id^="live-wallpaper-media"]');
          medias.forEach((el, i) => {
            if (i < medias.length - 1) {
              const htmlEl = el;
              htmlEl.style.transition = "opacity 1s ease-in-out";
              htmlEl.style.opacity = "0";
              setTimeout(() => {
                if (htmlEl.parentElement) {
                  htmlEl.remove();
                }
              }, 1e3);
            }
          });
          media = newMedia2;
          this.lastPath = newPath;
          this.lastType = newType;
        }
      }
      await this.saveSettings();
      return;
    }
    this.removeExistingWallpaperElements();
    const newContainer = this.createWallpaperContainer();
    const newMedia = await this.createMediaElement();
    if (newMedia) {
      newMedia.id = "live-wallpaper-media";
      newContainer.appendChild(newMedia);
    }
    const appContainer = document.querySelector(".app-container");
    if (appContainer) appContainer.insertAdjacentElement("beforebegin", newContainer);
    else document.body.appendChild(newContainer);
    document.body.classList.add("live-wallpaper-active");
    this.lastPath = newPath;
    this.lastType = newType;
  }
  async ensureWallpaperFolderExists() {
    try {
      const dir = this.manifest.dir;
      if (!dir) throw new Error("manifest.dir is undefined");
      const wallpaperFolder = `${dir}/wallpaper`;
      return await this.app.vault.adapter.exists(wallpaperFolder);
    } catch (e) {
      console.error("Failed to check wallpaper folder:", e);
      return false;
    }
  }
  removeExistingWallpaperElements() {
    const existingContainer = document.getElementById("live-wallpaper-container");
    const existingStyles = document.getElementById("live-wallpaper-overrides");
    const existingTitlebarStyles = document.getElementById("live-wallpaper-titlebar-styles");
    existingContainer?.remove();
    existingStyles?.remove();
    existingTitlebarStyles?.remove();
    document.body.classList.remove("live-wallpaper-active");
  }
  createWallpaperContainer() {
    const container = document.createElement("div");
    container.id = "live-wallpaper-container";
    Object.assign(container.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      zIndex: `${this.settings.zIndex}`,
      opacity: `${this.settings.opacity / 100}`,
      overflow: "hidden",
      pointerEvents: "none",
      filter: `blur(${this.settings.blurRadius}px) brightness(${this.settings.brightness}%)`
    });
    return container;
  }
  ChangeWallpaperContainer() {
    const container = document.getElementById("live-wallpaper-container");
    if (container == null) return;
    const width = this.settings.mobileBackgroundWidth || "100vw";
    const height = this.settings.mobileBackgroundHeight || "100vh";
    Object.assign(container.style, {
      width,
      height
    });
  }
  async createMediaElement() {
    const isVideo = this.settings.wallpaperType === "video";
    const media = isVideo ? document.createElement("video") : document.createElement("img");
    media.id = "live-wallpaper-media";
    if (media instanceof HTMLImageElement) {
      media.loading = "lazy";
    }
    const path = `${this.app.vault.configDir}/${this.settings.wallpaperPath}`;
    const exists = await this.app.vault.adapter.exists(path);
    if (exists) {
      media.src = this.app.vault.adapter.getResourcePath(path);
    } else {
      this.settings.wallpaperPath = "";
      return null;
    }
    this.applyMediaStyles(media);
    if (isVideo) {
      media.autoplay = true;
      media.loop = true;
      media.muted = true;
      media.playbackRate = this.settings.playbackSpeed;
    }
    return media;
  }
  applyMediaStyles(media) {
    media.removeAttribute("style");
    if (this.settings.INBUILD) {
      Object.assign(media.style, {
        width: "100%",
        height: "100%",
        objectFit: this.settings.useObjectFit ? "cover" : "unset",
        objectPosition: this.settings.Position,
        position: "absolute"
      });
    } else {
      Object.assign(media.style, {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        position: "absolute"
      });
    }
    if (this.settings.Quality) {
      Object.assign(media.style, {
        imageRendering: "auto",
        willChange: "transform",
        overflowClipMargin: "unset",
        overflow: "clip"
      });
    }
  }
  async openFilePicker(slotIndex) {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".jpg,.jpeg,.png,.gif,.mp4,.webm,.avif";
    fileInput.multiple = false;
    fileInput.addEventListener("change", async (event) => {
      const target = event.target;
      if (!target.files || target.files.length === 0) return;
      const file = target.files[0];
      const allowedExtensions = ["jpg", "jpeg", "png", "gif", "mp4", "webm", "avif"];
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (!extension || !allowedExtensions.includes(extension)) {
        alert("Unsupported file type!");
        return;
      }
      if (file.size > 12 * 1024 * 1024) {
        alert("File is too large (max 12MB).");
        return;
      }
      try {
        const baseDir = `${this.app.vault.configDir}/plugins/${this.manifest.id}/wallpapers`;
        const anyOptionEnabled = Scheduler.Check(this.settings.scheduledWallpapers.options);
        const arrayBuffer = await this.getFileArrayBuffer(file);
        const targetSubfolder = this.computeActiveSubfolder(anyOptionEnabled, slotIndex);
        let fileName = file.name;
        if (file.type.startsWith("image/") && this.settings.Quality) {
          const dotIndex = fileName.lastIndexOf(".");
          if (dotIndex !== -1) {
            fileName = fileName.slice(0, dotIndex) + "_quality" + fileName.slice(dotIndex);
          } else {
            fileName = fileName + "_quality";
          }
        }
        const activeRelPath = await this.saveUnder(baseDir, `active/${targetSubfolder}`, fileName, arrayBuffer);
        const historyRelPath = await this.saveUnder(baseDir, `history`, fileName, arrayBuffer);
        this.prependHistory({ path: historyRelPath, type: this.getWallpaperType(fileName), fileName });
        await this.trimHistory(5);
        if (anyOptionEnabled && typeof slotIndex === "number") {
          const { paths, types } = this.getCurrentWallpaperSet();
          await this.removeFileIfUnused(activeRelPath, paths[slotIndex], paths);
          paths[slotIndex] = activeRelPath;
          types[slotIndex] = this.getWallpaperType(fileName);
        } else {
          const folder = activeRelPath.substring(0, activeRelPath.lastIndexOf("/"));
          await this.removeAllExcept(folder, activeRelPath);
          this.settings.wallpaperPath = activeRelPath;
          this.settings.wallpaperType = this.getWallpaperType(fileName);
        }
        this.applyWallpaper(anyOptionEnabled);
      } catch (error) {
        alert("Could not save the file. Check disk permissions.");
        console.error(error);
      }
    });
    fileInput.click();
  }
  getWallpaperType(filename) {
    const extension = filename.split(".").pop()?.toLowerCase();
    if (["mp4", "webm"].includes(extension || "")) return "video";
    if (extension === "gif") return "gif";
    return "image";
  }
  async getFileArrayBuffer(file) {
    if (file.type.startsWith("image/")) {
      const blob = await this.resizeImageToBlob(file, this.settings.Quality);
      return blob.arrayBuffer();
    }
    return file.arrayBuffer();
  }
  computeActiveSubfolder(anyOption, slotIndex) {
    if (anyOption && typeof slotIndex === "number") {
      return this.isWeeklySchedulerEnabled() ? "weekly" : "daily";
    }
    return "normal";
  }
  async saveUnder(baseDir, subfolder, fileName, arrayBuffer) {
    const dir = `${baseDir}/${subfolder}`;
    await this.app.vault.adapter.mkdir(dir);
    const fullPath = `${dir}/${fileName}`;
    await this.app.vault.adapter.writeBinary(fullPath, arrayBuffer);
    return `plugins/${this.manifest.id}/wallpapers/${subfolder}/${fileName}`;
  }
  prependHistory(entry) {
    this.settings.HistoryPaths = [
      entry,
      ...this.settings.HistoryPaths.filter((e) => e.path !== entry.path)
    ];
  }
  async trimHistory(max) {
    const over = this.settings.HistoryPaths.length - max;
    if (over > 0) {
      const toRemove = this.settings.HistoryPaths.slice(max);
      this.settings.HistoryPaths = this.settings.HistoryPaths.slice(0, max);
      for (const e of toRemove) {
        const full = `${this.app.vault.configDir}/${e.path}`;
        await this.app.vault.adapter.remove(full).catch(() => {
        });
      }
    }
  }
  async removeFileIfUnused(newPath, oldPath, allPaths) {
    if (!oldPath) return;
    if (newPath === oldPath) return;
    const occurrences = allPaths.filter((path) => path === oldPath).length;
    if (occurrences <= 1) {
      const fullPath = `${this.app.vault.configDir}/${oldPath}`;
      await this.app.vault.adapter.remove(fullPath).catch(() => {
      });
    }
  }
  async removeAllExcept(dirPath, keepFilePath) {
    const fullDirPath = `${this.app.vault.configDir}/${dirPath}`;
    const files = await this.app.vault.adapter.list(fullDirPath).catch(() => null);
    if (!files || !files.files) return;
    for (const file of files.files) {
      if (file !== `${this.app.vault.configDir}/${keepFilePath}`) {
        await this.app.vault.adapter.remove(file).catch(() => {
        });
      }
    }
  }
  isWeeklySchedulerEnabled() {
    return this.settings.scheduledWallpapers.options.weekly ? true : false;
  }
  getCurrentWallpaperSet() {
    const isWeek = this.settings.scheduledWallpapers.options.weekly === true;
    return {
      paths: isWeek ? this.settings.scheduledWallpapers.wallpaperWeekPaths : this.settings.scheduledWallpapers.wallpaperDayPaths,
      types: isWeek ? this.settings.scheduledWallpapers.wallpaperWeekTypes : this.settings.scheduledWallpapers.wallpaperDayTypes
    };
  }
  async resizeImageToBlob(file, allowFullRes = false) {
    const img = await createImageBitmap(file);
    let MAX_WIDTH = window.innerWidth;
    if (import_obsidian6.Platform.isMobile) {
      const parsed = parseInt(this.settings.mobileBackgroundWidth);
      if (!isNaN(parsed)) {
        MAX_WIDTH = parsed;
      }
    }
    if (allowFullRes || img.width <= MAX_WIDTH) {
      return new Blob([await file.arrayBuffer()], { type: file.type });
    }
    const newWidth = MAX_WIDTH;
    const newHeight = img.height / img.width * newWidth;
    const canvas = new OffscreenCanvas(newWidth, newHeight);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    const bmp = await createImageBitmap(img, {
      resizeWidth: newWidth,
      resizeHeight: newHeight,
      resizeQuality: "high"
    });
    ctx.drawImage(bmp, 0, 0, newWidth, newHeight);
    return canvas.convertToBlob({ quality: 0.8, type: "image/jpeg" });
  }
  async LoadOrUnloadChanges(load) {
    for (const { target, attribute } of this.settings.TextArenas) {
      try {
        const attr = attribute?.trim();
        if (!attr) continue;
        const isVar = attr.startsWith("--");
        if (isVar) {
          const el2 = document.body.classList.contains("theme-dark") ? document.body : document.documentElement;
          if (load) {
            el2.style.setProperty(attr, "transparent", "important");
          } else {
            el2.style.removeProperty(attr);
          }
          continue;
        }
        const targetSelector = target?.trim();
        if (!targetSelector) continue;
        const el = document.querySelector(targetSelector);
        if (!el) continue;
        if (load) {
          el.style.setProperty(attr, "transparent", "important");
        } else {
          el.style.removeProperty(attr);
          if (!el.getAttribute("style")) {
            el.removeAttribute("style");
          }
        }
      } catch (error) {
        console.error("Error processing element:", { target, attribute }, error);
      }
    }
  }
  ApplyChanges(id) {
    const { target, attribute } = this.settings.TextArenas[id];
    const attr = attribute.trim();
    const isVar = attr.startsWith("--");
    const el = isVar ? document.body.classList.contains("theme-dark") ? document.body : document.documentElement : document.querySelector(target);
    if (!el) return;
    if (isVar) {
      el.style.setProperty(attr, "transparent", "important");
    } else {
      el.style.setProperty(attr, "transparent", "important");
    }
  }
  async RemoveChanges(id, oldAttribute) {
    if (id < 0 || id >= this.settings.TextArenas.length) {
      return;
    }
    const attribute = (oldAttribute ?? this.settings.TextArenas[id].attribute)?.trim();
    const target = this.settings.TextArenas[id].target?.trim();
    if (!attribute || !target) {
      return;
    }
    try {
      if (!attribute.startsWith("--")) {
        const el = document.querySelector(target);
        if (el) {
          el.style.removeProperty(attribute);
          if (!el.getAttribute("style")) {
            el.removeAttribute("style");
          }
        }
      } else {
        const el = document.body.classList.contains("theme-dark") ? document.body : document.documentElement;
        el.style.removeProperty(attribute);
        el.style.setProperty(attribute, "");
        el.removeAttribute("style");
      }
    } catch (error) {
      console.error(`Error removing '${attribute}' at index ${id}:`, error);
    }
    this.LoadOrUnloadChanges(true);
  }
  toggleModalStyles() {
    const styleId = "extrastyles-dynamic-css";
    const existingStyle = document.getElementById(styleId);
    if (this.settings.AdnvOpend) {
      if (!existingStyle) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
                  .modal-container.mod-dim {
                      background: rgba(0, 0, 0, 0.7);
                      backdrop-filter: blur(10px);
                  }
                  .modal-container {
                      background: rgba(0, 0, 0, 0.7);
                      backdrop-filter: blur(10px);
                  }
              `;
        document.head.appendChild(style);
      }
      this.LoadOrUnloadChanges(true);
    } else {
      this.LoadOrUnloadChanges(false);
      if (existingStyle) {
        existingStyle.remove();
      }
    }
  }
  RemoveModalStyles() {
    const styleId = "extrastyles-dynamic-css";
    const existingStyle = document.getElementById(styleId);
    existingStyle != null ? existingStyle.remove() : "";
  }
  async applyBackgroundColor() {
    const existingElement = document.getElementById("live-wallpaper-container");
    if (existingElement) {
      if (this.settings.AdnvOpend && this.settings.Color) {
        existingElement.parentElement?.style.setProperty("background-color", this.settings.Color, "important");
      }
      return;
    }
    await new Promise((resolve) => {
      const observer = new MutationObserver((mutations, obs) => {
        const element = document.getElementById("live-wallpaper-container");
        if (element) {
          obs.disconnect();
          resolve();
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    });
    if (this.settings.AdnvOpend && this.settings.Color) {
      const Main = document.getElementById("live-wallpaper-container");
      Main?.parentElement?.style.setProperty("background-color", this.settings.Color, "important");
    }
  }
  async clearBackgroundColor() {
    const Main = document.getElementById("live-wallpaper-container");
    Main?.parentElement?.style.removeProperty("background-color");
  }
  startDayNightWatcher() {
    this.stopDayNightWatcher();
    this._dayNightInterval = window.setInterval(() => {
      const { paths, types } = this.getCurrentWallpaperSet();
      const index = Scheduler.applyScheduledWallpaper(paths, this.settings.scheduledWallpapers.options);
      if (index !== null && paths[index]) {
        this.settings.wallpaperPath = paths[index];
        this.settings.wallpaperType = types[index];
        this.applyWallpaper(true);
      }
    }, Scheduler.getIntervalInMs(this.settings.scheduledWallpapers.options));
  }
  stopDayNightWatcher() {
    if (this._dayNightInterval) {
      clearInterval(this._dayNightInterval);
      this._dayNightInterval = -1;
    }
  }
  async cleanInvalidWallpaperHistory() {
    const validPaths = [];
    for (const entry of this.settings.HistoryPaths) {
      const fullPath = `${this.app.vault.configDir}/${entry.path}`;
      const exists = await this.app.vault.adapter.exists(fullPath);
      if (exists) {
        validPaths.push(entry);
      }
    }
    this.settings.HistoryPaths = validPaths;
    await this.saveSettings();
  }
};

/* nosourcemap */