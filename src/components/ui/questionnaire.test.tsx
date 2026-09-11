import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire";

const demoItems = [
  {
    name: "direction",
    title: "What should the agent build next?",
    description: "Choose a direction or describe another task.",
    required: true,
    choices: [
      { label: "Tool call timeline", value: "tool-calls" },
      { label: "Approval checkpoints", value: "approvals" },
    ],
  },
  {
    name: "signals",
    title: "What should every progress update include?",
    description: "Select all that apply, or skip this question.",
    multiple: true,
    required: false,
    choices: [
      { label: "Progress", value: "progress" },
      { label: "Decisions", value: "decisions" },
    ],
  },
  {
    name: "timing",
    title: "When should work begin?",
    description: "Choose when the agent should begin the work.",
    required: true,
    choices: [
      { label: "Start now", value: "now" },
      { label: "Next cycle", value: "next-cycle" },
    ],
  },
] as const;

function DemoQuestionnaire({ onSubmit }: { onSubmit: (e: React.FormEvent<HTMLFormElement>) => void }) {
  return (
    <Questionnaire
      defaultItem="direction"
      items={demoItems}
      shortcuts="letters"
      onSubmit={onSubmit}
    >
      <QuestionnaireProgress showPercentage />
      {demoItems.map((question) => (
        <QuestionnaireItem
          key={question.name}
          multiple={"multiple" in question && question.multiple}
          name={question.name}
          required={question.required}
        >
          <QuestionnaireTitle>{question.title}</QuestionnaireTitle>
          <QuestionnaireDescription>{question.description}</QuestionnaireDescription>
          <QuestionnaireChoices>
            {question.choices.map((choice) => (
              <QuestionnaireChoice key={choice.value} value={choice.value}>
                <span className="font-medium">{choice.label}</span>
              </QuestionnaireChoice>
            ))}
            {question.name === "direction" && (
              <QuestionnaireInput placeholder="Describe another feature..." />
            )}
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
      ))}
      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireSkip />
        <QuestionnaireNext>Next</QuestionnaireNext>
        <QuestionnaireSubmit>Save plan</QuestionnaireSubmit>
      </QuestionnaireActions>
    </Questionnaire>
  );
}

describe("Questionnaire Component", () => {
  test("renders first question and navigates through steps to submission", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn((e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
    });

    render(<DemoQuestionnaire onSubmit={handleSubmit} />);

    // First question is visible
    expect(screen.getByText("What should the agent build next?")).toBeVisible();
    expect(screen.getByText("Tool call timeline")).toBeVisible();

    // Choice A and B shortcuts
    expect(screen.getByText("A")).toBeVisible();
    expect(screen.getByText("B")).toBeVisible();

    // Select choice
    await user.click(screen.getByText("Tool call timeline"));

    // Click Next
    await user.click(screen.getByRole("button", { name: "Next" }));

    // Second question
    expect(screen.getByText("What should every progress update include?")).toBeVisible();

    // Skip second question (it is optional)
    await user.click(screen.getByRole("button", { name: "O'tkazib yuborish" }));

    // Third question (final step)
    expect(screen.getByText("When should work begin?")).toBeVisible();

    // Submit button is present on final step
    expect(screen.getByRole("button", { name: "Save plan" })).toBeVisible();

    // Select answer on final question
    await user.click(screen.getByText("Start now"));

    // Submit
    await user.click(screen.getByRole("button", { name: "Save plan" }));
    expect(handleSubmit).toHaveBeenCalled();
  });
});
