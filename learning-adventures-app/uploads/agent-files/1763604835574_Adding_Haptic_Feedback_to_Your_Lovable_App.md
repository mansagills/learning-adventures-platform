

**AI summary**  
This document provides a guide on how to add haptic feedback to a Lovable app when it's converted to a native mobile app using Median. It explains what haptic feedback is, why it's important, and how it works with Median's JavaScript Bridge. The guide outlines different types of haptic feedback (impact, notification, and special haptics) and provides "AI prompts" for adding them to various app interactions like button taps, form submissions, and delete actions. It also includes information on testing haptics on a physical device, troubleshooting common issues, and best practices for implementation.

---

# Adding Haptic Feedback to Your Lovable App

## Overview

Haptic feedback, those subtle vibrations you feel when tapping buttons on your phone, makes apps feel more responsive and professional. This guide walks you through how to add haptic feedback to your Lovable app when it's converted to a native mobile app using Median.

**What you'll learn:**

* What haptic feedback is and why it matters  
* How to use AI prompts to add haptics to your app  
* How to test haptics on a real device

**Prerequisites:**

- [ ] [Enable the Haptic Feedback plugin  in the Median App Studio](https://median.co/docs/haptics#try-the-haptics-plugin)  
- [ ] Add App Usage Detection  
- [ ] A Lovable app with Median's JavaScript Bridge already installed  
- [ ] Basic familiarity with Lovable's chat interface

**Note:** If you haven't installed the Median JavaScript Bridge yet, do that first by following our Getting Started with Lovable guide. The JavaScript Bridge is what allows your Lovable app to access native phone features like haptic feedback.

---

## What is Haptic Feedback?

Haptic feedback is the gentle vibration you feel when you interact with your phone. You experience it when:

* Typing on your phone keyboard  
* Pulling down to refresh an app  
* Confirming a successful action  
* Getting an error message

**Why add haptics to your app?**

✅ **Better user experience** – Physical feedback confirms that an action actually worked  
✅ **More professional** – Your app feels like a "real" native app  
✅ **Improved accessibility** – Helps users who rely on touch feedback  
✅ **Clearer communication** – Different vibration patterns signal success, errors, or warnings

---

## How Haptics Work in Median

When you convert your Lovable app to mobile using Median, the JavaScript Bridge gives your app access to phone features like haptic feedback. Think of it like this:

* Your **Lovable app** is the website or web app you built  
* **Median** wraps your app in a native app shell  
* The **JavaScript Bridge** lets your app "talk" to the phone's vibration motor

You simply tell Lovable's AI where you want haptics, and it will add the necessary code using the JavaScript Bridge.

---

## Step 1: Choose Your Haptics

Median offers several types of haptic feedback:

### Impact Haptics (for interactions)

Use these when someone taps, swipes, or interacts with something:

| Type | When to Use | Feels Like |
| ----- | ----- | ----- |
| impactLight | Standard button taps | Quick, gentle tap |
| impactMedium | Important selections | Noticeable tap |
| impactHeavy | Major actions (like "Delete") | Strong, deliberate tap |

### Notification Haptics (for outcomes)

Use these to communicate results:

| Type | When to Use | Feels Like |
| ----- | ----- | ----- |
| notificationSuccess | Action completed successfully | Positive, two-part vibration |
| notificationWarning | Proceed with caution | Moderate, attention-getting |
| notificationError | Something went wrong | Sharp, negative feedback |

### Special Haptics

Additional feedback types for specific interactions:

| Type | When to Use |
| ----- | ----- |
| tick | Scrolling through picker values |
| click | Single tap confirmation |
| double\_click | Double tap confirmation |

**Decision Helper:**

* Button pressed? → Use impactLight  
* Action completed successfully? → Use notificationSuccess  
* Validation error? → Use notificationError  
* Deleting something? → Use impactMedium or impactHeavy

---

## Step 2: Add Haptics Using AI Prompts

The easiest way to add haptics is to ask Lovable's AI assistant. Below are ready-to-use prompts for common scenarios.

### Example: Adding Haptics to Task Creation

Let's walk through a real example of adding haptic feedback when a user creates a new item in your app.

**The Prompt:**

```
When creating a new task, please add haptic feedback using the Median JavaScript Bridge. This should only be done for mobile app users. Reference the detecting 
app usage page in the Median documentation.

Use the notificationSuccess haptic style to give positive feedback when the 
task is successfully created.
```

**What Lovable Will Do:**

Lovable will understand your request and implement:

1. **Detection** – Check if the user is in the native mobile app (not the web version)  
2. **Haptic Integration** – Add haptic feedback using Median.haptics.trigger({ style: 'notificationSuccess' })  
3. **Proper Timing** – Trigger the haptic right when the task is successfully created

**What the Code Will Look Like:**

Here's what Lovable will add to your app (you don't need to write this, it’s just for your reference):

```
// Haptic feedback function
const triggerHaptic = (style: 'impactLight' | 'impactMedium' | 'impactHeavy' | 
  'notificationSuccess' | 'notificationWarning' | 'notificationError' | 
  'tick' | 'click' | 'double_click') => {
  if (isNativeApp && isReady) {
    try {
      // Use the Median JavaScript Bridge for haptic feedback
      Median.haptics.trigger({ style });
    } catch (error) {
      console.log('Haptic feedback error:', error);
    }
  }
};

// When creating a new task
const createTask = () => {
  // ... task creation logic ...
  
  // Trigger success haptic for mobile app users
  triggerHaptic('notificationSuccess');
};
```

**What this does:**

1. **Checks if the user is in the mobile app** (isNativeApp) – so web users don't get errors  
2. **Waits for the JavaScript Bridge to be ready** (isReady) – ensures Median is loaded  
3. **Triggers the haptic** – uses Median.haptics.trigger() to vibrate the phone  
4. **Handles errors** – logs any issues without breaking your app

---

## Step 3: More Prompt Examples

Here are additional prompts you can customize for your specific needs:

### Prompt: Add Haptics to a Button

```
Add haptic feedback to the [BUTTON_NAME] button. When the user taps this button, 
trigger an impactLight haptic using Median's JavaScript Bridge.

This should only work for mobile app users. Use Median.isNativeApp() to detect 
if the user is in the native app.
```

**Customize:**

* Replace \[BUTTON\_NAME\] with your actual button (e.g., "Submit button", "Save button")  
* Change impactLight to impactMedium or impactHeavy for more important buttons

---

### Prompt: Add Haptics to Form Submission

```
Add haptic feedback to the [FORM_NAME] form submission:

1. If the form submits successfully, trigger a notificationSuccess haptic
2. If there are validation errors, trigger a notificationError haptic

Use Median's JavaScript Bridge with Median.haptics.trigger({ style }).
Only trigger haptics for mobile app users using Median.isNativeApp().
```

**Customize:**

* Replace \[FORM\_NAME\] with your form (e.g., "contact form", "signup form")

---

## Understanding How It Works

When Lovable adds haptics to your app, it follows a specific pattern to ensure everything works correctly:

### The Detection Pattern

```
if (isNativeApp && isReady) {
  // Trigger haptic feedback
}
```

**Why this matters:**

* **isNativeApp** – Checks if running in the Median mobile app (not the web browser)  
* **Median.onReady** – Ensures the Median JavaScript Bridge has loaded completely  
* **Safety first** – Prevents errors when users view your app in a regular browser and ensures that the library is initialized and ready to use

### The Haptic Trigger

```
Median.haptics.trigger({ style: 'notificationSuccess' });
```

**What happens:**

1. Calls the Median JavaScript Bridge API  
2. Sends the haptic style you specified  
3. Phone vibrates with the appropriate pattern  
4. User feels confirmation of their action

### Error Handling

```
try {
  Median.haptics.trigger({ style });
} catch (error) {
  console.log('Haptic feedback error:', error);
}
```

**Why this matters:**

* If something goes wrong, your app continues working  
* Errors are logged for debugging, but don't break the user experience  
* Haptics are treated as an enhancement, not a requirement

---

## Step 4: Testing Your Haptics

⚠️ **Important:** Haptic feedback **only works on a physical device**, not in a web browser or simulator.

### **How to Test:**

1. **Build your app in Median**  
   * Follow Median's build process to create a test version  
2. **Install on your phone**  
   * **iPhone:** Use TestFlight for beta testing  
   * **Android:** Use direct install or Google Play internal testing  
3. **Check device settings**  
   * **iPhone:** Settings → Sounds & Haptics → System Haptics (must be ON)  
   * **Android:** Settings → Sound → Vibration (must be ON)  
4. **Test each interaction**  
   * Tap buttons that should have haptics  
   * Submit forms (both success and error cases)  
   * Verify the vibration matches your intention

### **Troubleshooting:**

| Problem | Solution |
| ----- | ----- |
| No vibration at all | Verify haptics are enabled in phone settings |
| Vibration in web browser | This shouldn't happen since the isNativeApp check prevents it |
| Wrong vibration type | Check your prompt specified the correct style (impactLight, notificationSuccess, etc.) |
| Some actions work, others don't | Make sure you added haptics to all intended actions in your prompts |
| Console shows errors | Check that the Median JavaScript Bridge is properly installed |

---

## **Quick Reference: Which Haptic to Use**

| User Action | Recommended Haptic | Median API |
| ----- | ----- | ----- |
| Standard button tap | impactLight | Median.haptics.trigger({ style: 'impactLight' }) |
| Important selection | impactMedium | Median.haptics.trigger({ style: 'impactMedium' }) |
| Delete/destructive action | impactHeavy | Median.haptics.trigger({ style: 'impactHeavy' }) |
| Action completed successfully | notificationSuccess | Median.haptics.trigger({ style: 'notificationSuccess' }) |
| Warning or caution | notificationWarning | Median.haptics.trigger({ style: 'notificationWarning' }) |
| Error or failure | notificationError | Median.haptics.trigger({ style: 'notificationError' }) |
| Scrolling through picker | tick | Median.haptics.trigger({ style: 'tick' }) |
| Single tap confirmation | click | Median.haptics.trigger({ style: 'click' }) |

---

## **Best Practices**

### **✅ Do:**

* **Use haptics sparingly** – Too much vibration is annoying and drains battery  
* **Match the haptic to the action** – Use impactLight for simple taps, notificationSuccess for completions  
* **Test on both iPhone and Android** – They feel slightly different  
* **Be consistent** – Use the same haptic types for similar actions throughout your app  
* **Provide visual feedback too** – Don't rely only on haptics (users might have them disabled)  
* **Let Lovable handle the detection** – It will properly check for the native app environment

### **❌ Don't:**

* **Use warning haptics casually** – Reserve these for actual warnings or destructive actions  
* **Forget to mention mobile-only** – Always include "for mobile app users only" in your prompts  
* **Skip testing on real devices** – Haptics can't be felt in browsers or simulators

---

## **Need Help?**

**Common questions:**

**Q: Will haptics work in the Lovable preview?**  
A: No, you need to build and install the app through Median to test haptics on a real device. The web preview won't trigger haptics.

**Q: Do I need to install anything special?**  
A: Yes, you need the Median JavaScript Bridge installed in your app first. If you haven't done this, follow [this guide](https://median.co/docs/javascript-bridge).

**Q: Can I customize the exact vibration pattern?**  
A: Median provides predefined styles that work consistently across iOS and Android. You can't create fully custom patterns, but we can help you execute custom patterns. Contact us for assistance.

**Q: What if I want haptics on the web too?**  
A: Standard web browsers have limited haptic support. The Median approach focuses on native mobile apps where haptics work reliably. If you remove the isNativeApp check, some browsers might vibrate, but it's not guaranteed.

**Q: Do I need to know how to code?**  
A: No\! Just copy the prompts from this guide, customize the button/form/action names, and paste them into Lovable's chat. Lovable handles all the code implementation.

**Q: Will this work on all phones?**  
A: Yes, both iPhone and Android support haptic feedback. Older devices may have simpler vibration motors, so some styles might feel similar.

---

## **What's Next?**

Now that you've added haptic feedback, consider these next steps:

1. **Add more native features** – Explore biometric authentication, push notifications, or camera access using the Median JavaScript Bridge  
2. **Optimize for mobile** – Review Median's mobile optimization best practices  
3. **Test with real users** – Get feedback on whether the haptics feel right  
4. **Publish your app** – Follow Median's guide to submit to the App Store and Google Play

**Was this guide helpful?** Let us know what else you'd like to learn about adding native features to your Lovable app.