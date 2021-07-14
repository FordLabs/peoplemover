import {calculateGradient} from "./NewBadge";
import moment, {Moment} from "moment";


describe('NewBadge', () => {
    
    describe('calculateGradient()', () => {

        const baseMoment = moment("2021-01-01");

        it('should return empty string if newPersonDate is same as viewingDate',  () =>  {

            const newPersonDate: Date = baseMoment.toDate();
            const viewingDate: Date = newPersonDate;

            expect(calculateGradient(newPersonDate, viewingDate)).toBe('');
        });


        it('should return stage2 string if viewingDate is 8 days ahead of newPersonDate',  () =>  {
            const newPersonDate: Date = baseMoment.toDate();
            const viewingDate: Date = baseMoment.add(8, 'days').toDate();

            expect(calculateGradient(newPersonDate, viewingDate)).toBe('stage2');
        });

        it('should return stage2 string if viewingDate is 15 days ahead of newPersonDate',  () =>  {
            const newPersonDate: Date = baseMoment.toDate();
            const viewingDate: Date = baseMoment.add(15, 'days').toDate();

            expect(calculateGradient(newPersonDate, viewingDate)).toBe('stage2');
        });

        it('should return stage3 string if viewingDate is 16 days ahead of newPersonDate',  () =>  {
            const newPersonDate: Date = baseMoment.toDate();
            const viewingDate: Date = baseMoment.add(16, 'days').toDate();


            expect(calculateGradient(newPersonDate, viewingDate)).toBe('stage3');
        });

        it('should return stage3 string if today is 100 days ahead of newPersonDate',  () =>  {
            const newPersonDate: Date = baseMoment.toDate();
            const viewingDate: Date = baseMoment.add(100, 'days').toDate();


            expect(calculateGradient(newPersonDate, viewingDate)).toBe('stage3');
        });
    });



});
