import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs";
import careerData from "../data/career.json";
import educationData from "../data/education.json";
import { careerSchema, educationSchema } from "../lib/schemas";
import Timeline from "./Timeline";
import TechStack from "./TechStack";

export default function Experience() {
    const career = careerSchema.parse(careerData).career;
    const education = educationSchema.parse(educationData).education;

    return (
        <div className="space-y-8">
            
            <TechStack />

            <div className="relative isolate">
                <Tabs defaultValue="work" className="bg-transparent">
                    <TabsList className="mb-2 grid w-full grid-cols-2 bg-transparent">
                        <TabsTrigger value="work" className="bg-transparent">Work</TabsTrigger>
                        <TabsTrigger value="education" className="bg-transparent">Education</TabsTrigger>
                    </TabsList>
                    <TabsContent value="work" className="bg-transparent">
                        <div className="bg-transparent">
                            <Timeline experience={career}></Timeline>
                        </div>
                    </TabsContent>
                    <TabsContent value="education" className="bg-transparent">
                        <div className="bg-transparent">
                            <Timeline experience={education}></Timeline>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
