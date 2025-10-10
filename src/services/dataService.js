// src/services/dataService.js
export async function getEmployees() {
  return [
    { id: 1, first_name: "John", last_name: "Doe" },
    { id: 2, first_name: "Jane", last_name: "Smith" }
  ];
}

export async function getXmlData() {
  return `
    <data>
      <template>
        <template_folder_name>Safety Template</template_folder_name>
        <question>
          <_text>What is safety?</_text>
          <answer>It’s ensuring no accidents occur.</answer>
        </question>
        <question>
          <_text>Who is responsible?</_text>
          <answer>Everyone.</answer>
        </question>
      </template>
      <template>
        <template_folder_name>Training Template</template_folder_name>
        <question>
          <_text>How often do we train?</_text>
          <answer>Monthly.</answer>
        </question>
        <question>
          <_text>Who organizes training?</_text>
          <answer>HR Department.</answer>
        </question>
      </template>
    </data>
  `;
}
